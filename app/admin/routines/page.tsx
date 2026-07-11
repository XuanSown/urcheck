'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format-utils';

interface Routine {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
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

export default function RoutinesPage() {
  const { toast } = useToast();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Routine | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchRoutines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/routines?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRoutines(data.data.routines);
        setPagination(data.data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err) || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    (async () => { await fetchRoutines(); })();
  }, [fetchRoutines]);

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
      const res = await fetch(`/api/admin/routines/${target.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setRoutines((prev) => prev.filter((r) => r.id !== target.id));
        toast({ type: 'success', title: 'Đã xóa quy trình', description: target.title });
      } else {
        toast({ type: 'error', title: 'Thất bại', description: data.error });
      }
    } catch (err: unknown) {
      toast({ type: 'error', title: 'Lỗi', description: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
      setPendingDelete(null);
    }
  };

  const customerLabel = (r: Routine) =>
    r.customer.email || `Khách ${r.customer.id.slice(0, 8)}`;

  const visibilityBadge = (publicRoutine: boolean) =>
    publicRoutine
      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

  return (
    <div className="space-y-6">
      <PageHeader title="Quy trình chăm sóc" description="Quản lý quy trình skincare của người dùng" />

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
            placeholder="Tìm theo tên quy trình"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800"
          />
        </div>
      </form>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : routines.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có quy trình nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Công khai</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số bước</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {routines.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{r.title}</div>
                      {r.description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {customerLabel(r)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${visibilityBadge(r.isPublic)}`}>
                        {r.isPublic ? 'Công khai' : 'Riêng tư'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {r._count.items}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() => setPendingDelete(r)}
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
            Trang {pagination.page} / {pagination.totalPages} ({pagination.total} quy trình)
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
        title="Xóa quy trình?"
        description={
          pendingDelete
            ? `Hành động này sẽ xóa vĩnh viễn "${pendingDelete.title}" và toàn bộ bước bên trong. Không thể hoàn tác.`
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
