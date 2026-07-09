'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format-utils';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  colorHex: string | null;
  createdAt: string;
  customer: { id: string; email: string | null };
  _count: { items: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CollectionsPage() {
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Collection | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/collections?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCollections(data.data.collections);
        setPagination(data.data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    const target = pendingDelete;
    try {
      const res = await fetch(`/api/admin/collections/${target.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCollections((prev) => prev.filter((c) => c.id !== target.id));
        toast({ type: 'success', title: 'Đã xóa bộ sưu tập', description: target.name });
      } else {
        toast({ type: 'error', title: 'Thất bại', description: data.error });
      }
    } catch (err: any) {
      toast({ type: 'error', title: 'Lỗi', description: err.message });
    } finally {
      setBusy(false);
      setPendingDelete(null);
    }
  };

  const customerLabel = (c: Collection) =>
    c.customer.email || `Khách ${c.customer.id.slice(0, 8)}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Bộ sưu tập" description="Quản lý bộ sưu tập của người dùng" />

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên bộ sưu tập"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800"
          />
        </div>
      </form>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : collections.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có bộ sưu tập nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số sản phẩm</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {collections.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: c.colorHex || '#f97316' }}
                        />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                      </div>
                      {c.description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {customerLabel(c)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {c._count.items}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(c.createdAt)}
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() => setPendingDelete(c)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Trang {pagination.page} / {pagination.totalPages} ({pagination.total} bộ sưu tập)
          </span>
          <Button
            variant="outline"
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          >
            Sau
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Xóa bộ sưu tập?"
        description={
          pendingDelete
            ? `Hành động này sẽ xóa vĩnh viễn "${pendingDelete.name}" và toàn bộ sản phẩm bên trong. Không thể hoàn tác.`
            : undefined
        }
        danger
        confirmLabel="Xóa"
        loading={busy}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
