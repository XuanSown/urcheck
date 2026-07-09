'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format-utils';

interface Customer {
  id: string;
  deviceId: string;
  email: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type ActiveFilter = 'all' | 'true' | 'false';

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [page, setPage] = useState(1);

  const [pendingToggle, setPendingToggle] = useState<Customer | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (search) params.set('search', search);
      if (activeFilter !== 'all') params.set('isActive', activeFilter);
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data.customers);
        setPagination(data.data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [page, search, activeFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleToggleConfirm = async () => {
    if (!pendingToggle) return;
    setBusy(true);
    const target = pendingToggle;
    const next = !target.isActive;
    try {
      const res = await fetch(`/api/admin/customers/${target.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === target.id ? { ...c, isActive: next } : c))
        );
        toast({
          type: 'success',
          title: next ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản',
          description: target.email || target.deviceId,
        });
      } else {
        toast({ type: 'error', title: 'Thất bại', description: data.error });
      }
    } catch (err: any) {
      toast({ type: 'error', title: 'Lỗi', description: err.message });
    } finally {
      setBusy(false);
      setPendingToggle(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    const target = pendingDelete;
    try {
      const res = await fetch(`/api/admin/customers/${target.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCustomers((prev) => prev.filter((c) => c.id !== target.id));
        toast({ type: 'success', title: 'Đã xóa khách hàng', description: target.email || target.deviceId });
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

  const statusBadge = (active: boolean) =>
    active
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  const verifiedBadge = (verified: boolean) =>
    verified
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

  const filters: { key: ActiveFilter; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'true', label: 'Hoạt động' },
    { key: 'false', label: 'Đã khóa' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Khách hàng" description="Quản lý tài khoản người dùng" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              placeholder="Tìm theo email hoặc device ID"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setPage(1);
                setActiveFilter(f.key);
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === f.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có khách hàng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Họ tên / Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SĐT</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Xác minh</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Đăng nhập cuối</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {c.email || c.deviceId}
                      </div>
                      {c.email && (
                        <div className="text-xs text-gray-500">{c.deviceId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      —
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge(c.isActive)}`}>
                        {c.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${verifiedBadge(c.isVerified)}`}>
                        {c.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {c.lastLogin ? formatDateTime(c.lastLogin) : 'Chưa đăng nhập'}
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() => setPendingToggle(c)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm transition-colors"
                      >
                        {c.isActive ? 'Khóa' : 'Kích hoạt'}
                      </button>
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
            Trang {pagination.page} / {pagination.totalPages} ({pagination.total} khách hàng)
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
        open={!!pendingToggle}
        title={pendingToggle?.isActive ? 'Khóa tài khoản?' : 'Kích hoạt tài khoản?'}
        description={
          pendingToggle
            ? `Bạn có chắc muốn ${pendingToggle.isActive ? 'khóa' : 'kích hoạt'} tài khoản ${pendingToggle.email || pendingToggle.deviceId}?`
            : undefined
        }
        danger={pendingToggle?.isActive}
        confirmLabel={pendingToggle?.isActive ? 'Khóa' : 'Kích hoạt'}
        loading={busy}
        onConfirm={handleToggleConfirm}
        onCancel={() => setPendingToggle(null)}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Xóa khách hàng?"
        description={
          pendingDelete
            ? `Hành động này sẽ xóa vĩnh viễn ${pendingDelete.email || pendingDelete.deviceId} và toàn bộ dữ liệu liên quan. Không thể hoàn tác.`
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
