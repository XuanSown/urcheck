'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/admin/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '@/lib/format-utils';

interface QrCode {
  id: string;
  code: string;
  url: string;
  scanCount: number;
  isActive: boolean;
  createdAt: string;
  product: { id: string; name: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function QrCodesPage() {
  const { toast } = useToast();
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');

  // QR view modal
  const [viewQr, setViewQr] = useState<QrCode | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<QrCode | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Optimistic toggle tracking
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchQrCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(activeFilter !== 'all' && { isActive: activeFilter }),
      });
      const res = await fetch(`/api/admin/qrcodes?${params}`);
      const data = await res.json();
      if (data.success) {
        setQrCodes(data.data.qrCodes);
        setPagination(data.data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [page, search, activeFilter]);

  useEffect(() => {
    fetchQrCodes();
  }, [fetchQrCodes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleToggle = async (qr: QrCode) => {
    setTogglingId(qr.id);
    // optimistic
    setQrCodes((prev) =>
      prev.map((q) => (q.id === qr.id ? { ...q, isActive: !q.isActive } : q))
    );
    try {
      const res = await fetch(`/api/admin/qrcodes/${qr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !qr.isActive }),
      });
      const data = await res.json();
      if (!data.success) {
        // revert
        setQrCodes((prev) =>
          prev.map((q) => (q.id === qr.id ? { ...q, isActive: qr.isActive } : q))
        );
        toast({ title: 'Lỗi', description: data.error, type: 'error' });
      } else {
        toast({
          title: !qr.isActive ? 'Đã kích hoạt mã QR' : 'Đã khóa mã QR',
          type: 'success',
        });
      }
    } catch (err: any) {
      setQrCodes((prev) =>
        prev.map((q) => (q.id === qr.id ? { ...q, isActive: qr.isActive } : q))
      );
      toast({ title: 'Lỗi', description: 'Cập nhật trạng thái thất bại', type: 'error' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/qrcodes/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setQrCodes((prev) => prev.filter((q) => q.id !== deleteTarget.id));
        setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
        toast({ title: 'Đã xóa mã QR', type: 'success' });
      } else {
        toast({ title: 'Lỗi', description: data.error, type: 'error' });
      }
    } catch (err: any) {
      toast({ title: 'Lỗi', description: 'Xóa mã QR thất bại', type: 'error' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: 'Đã sao chép mã', description: code, type: 'success' });
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể sao chép', type: 'error' });
    }
  };

  const statusBadge = (active: boolean) =>
    active
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mã QR"
        description="Quản lý mã QR sản phẩm"
      />

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm theo mã hoặc tên sản phẩm..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-950"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as 'all' | 'true' | 'false');
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-950 min-h-[44px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Đã khóa</option>
          </select>
        </div>
      </Card>

      {error && (
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
          <div className="text-red-700 dark:text-red-400">{error}</div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Đang tải...</div>
        ) : qrCodes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Chưa có mã QR nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {search || activeFilter !== 'all'
                ? 'Không tìm thấy mã QR phù hợp với bộ lọc'
                : 'Mã QR được tạo tự động khi thêm sản phẩm mới'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Lượt quét</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {qrCodes.map((qr) => (
                  <tr key={qr.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="font-mono text-sm text-gray-900 dark:text-gray-100">{qr.code}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{qr.product.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                      {qr.scanCount.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge(qr.isActive)}`}>
                        {qr.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(qr.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setViewQr(qr)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm transition-colors"
                        >
                          Xem QR
                        </button>
                        <button
                          onClick={() => handleToggle(qr)}
                          disabled={togglingId === qr.id}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-medium text-sm transition-colors disabled:opacity-50"
                        >
                          {qr.isActive ? 'Khóa' : 'Kích hoạt'}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(qr)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </Button>
          <span className="flex items-center px-3 text-sm text-gray-600 dark:text-gray-400">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          >
            Sau
          </Button>
        </div>
      )}

      {/* QR view modal */}
      <Modal open={!!viewQr} onClose={() => setViewQr(null)} title="Mã QR sản phẩm" size="md">
        {viewQr && (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-xl">
              <QRCodeSVG value={viewQr.url} size={220} />
            </div>
            <div className="w-full">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Mã</div>
              <code className="block font-mono text-sm text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 break-all">
                {viewQr.code}
              </code>
            </div>
            <div className="w-full">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">URL</div>
              <div className="block text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 break-all">
                {viewQr.url}
              </div>
            </div>
            <Button className="w-full" onClick={() => copyCode(viewQr.code)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Sao chép mã
            </Button>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa mã QR"
        description={
          deleteTarget
            ? `Bạn có chắc chắn muốn xóa mã QR "${deleteTarget.code}" không? Hành động này không thể hoàn tác.`
            : undefined
        }
        confirmLabel="Xóa"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
