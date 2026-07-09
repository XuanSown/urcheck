'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format-utils';

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Review {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  product: { id: string; name: string };
  customer: { id: string; email: string | null };
}

const STATUS_FILTERS: { key: '' | ReviewStatus; label: string }[] = [
  { key: '', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Từ chối' },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const styles: Record<ReviewStatus, string> = {
    PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  };
  const label = status === 'PENDING' ? 'Chờ duyệt' : status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối';
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{label}</span>
  );
}

const customerLabel = (c: { id: string; email: string | null }) => c.email || `KH-${c.id.slice(0, 6)}`;

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'' | ReviewStatus>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [pendingAction, setPendingAction] = useState<Review | null>(null);
  const [dialogMode, setDialogMode] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchReviews = useCallback(async (pageNum: number, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: pageNum.toString(), limit: '20' });
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi tải dữ liệu');
      setReviews(data.data.reviews);
      setTotalPages(data.data.pagination.totalPages);
      setTotal(data.data.pagination.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(page, statusFilter);
  }, [page, statusFilter, fetchReviews]);

  const openDialog = (review: Review, mode: 'approve' | 'reject' | 'delete') => {
    setPendingAction(review);
    setDialogMode(mode);
  };
  const closeDialog = () => {
    setPendingAction(null);
    setDialogMode(null);
  };

  const moderate = async (review: Review, status: 'APPROVED' | 'REJECTED') => {
    setBusyId(review.id);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thao tác thất bại');
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status } : r)));
      toast({
        type: 'success',
        title: status === 'APPROVED' ? 'Đã duyệt đánh giá' : 'Đã từ chối đánh giá',
      });
    } catch (err: any) {
      toast({ type: 'error', title: 'Thất bại', description: err.message });
    } finally {
      setBusyId(null);
      closeDialog();
    }
  };

  const removeReview = async (review: Review) => {
    setBusyId(review.id);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa thất bại');
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      toast({ type: 'success', title: 'Đã xóa đánh giá' });
    } catch (err: any) {
      toast({ type: 'error', title: 'Thất bại', description: err.message });
    } finally {
      setBusyId(null);
      closeDialog();
    }
  };

  const dialogConfig = {
    approve: { title: 'Duyệt đánh giá', description: 'Xác nhận duyệt đánh giá này để hiển thị công khai?', label: 'Duyệt', danger: false },
    reject: { title: 'Từ chối đánh giá', description: 'Xác nhận từ chối đánh giá này?', label: 'Từ chối', danger: true },
    delete: { title: 'Xóa đánh giá', description: 'Hành động này không thể hoàn tác. Xác nhận xóa đánh giá?', label: 'Xóa', danger: true },
  }[dialogMode || 'delete'];

  return (
    <div className="space-y-6">
      <PageHeader title="Đánh giá sản phẩm" description="Duyệt và quản lý đánh giá từ khách hàng" />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setStatusFilter(f.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                statusFilter === f.key
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {error && (
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
          <div className="text-red-700 dark:text-red-400">{error}</div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Chưa có đánh giá</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {statusFilter ? 'Không có đánh giá ở trạng thái này' : 'Chưa có đánh giá nào từ khách hàng'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Sản phẩm</th>
                  <th className="text-left px-4 py-3 font-medium">Khách hàng</th>
                  <th className="text-left px-4 py-3 font-medium">Đánh giá</th>
                  <th className="text-left px-4 py-3 font-medium">Tiêu đề/Nội dung</th>
                  <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-medium">Thời gian</th>
                  <th className="text-right px-4 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {reviews.map((r) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors align-top"
                  >
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{r.product.name}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {customerLabel(r.customer)}
                      {r.isVerifiedPurchase && (
                        <span className="ml-1 text-xs text-green-600 dark:text-green-400">✓</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Stars rating={r.rating} />
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{r.title || '(không tiêu đề)'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{r.body || '—'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== 'APPROVED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog(r, 'approve')}
                            loading={busyId === r.id}
                            aria-label="Duyệt"
                            className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </Button>
                        )}
                        {r.status !== 'REJECTED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog(r, 'reject')}
                            loading={busyId === r.id}
                            aria-label="Từ chối"
                            className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(r, 'delete')}
                          loading={busyId === r.id}
                          aria-label="Xóa"
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <span className="flex items-center px-3 text-sm text-gray-600 dark:text-gray-400">
            Trang {page} / {totalPages} ({total})
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Sau
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={dialogMode !== null}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmLabel={dialogConfig.label}
        danger={dialogConfig.danger}
        loading={pendingAction ? busyId === pendingAction.id : false}
        onConfirm={() => {
          if (!pendingAction || !dialogMode) return;
          if (dialogMode === 'delete') removeReview(pendingAction);
          else moderate(pendingAction, dialogMode === 'approve' ? 'APPROVED' : 'REJECTED');
        }}
        onCancel={closeDialog}
      />
    </div>
  );
}
