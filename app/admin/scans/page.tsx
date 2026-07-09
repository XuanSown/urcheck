'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/admin/PageHeader';
import { formatDateTime } from '@/lib/format-utils';
import { useToast } from '@/components/ui/Toast';

interface Scan {
  id: string;
  scannedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  qrCode: { code: string };
  product: { id: string; name: string };
}

interface ScansResponse {
  success: boolean;
  data: {
    scans: Scan[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

export default function AdminScansPage() {
  const { toast } = useToast();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchScans = useCallback(async (pageNum: number, searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/admin/scans?${params}`);
      const data: ScansResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error((data as any).error || 'Lỗi khi tải dữ liệu');
      }

      setScans(data.data.scans);
      setTotalPages(data.data.pagination.totalPages);
      setTotal(data.data.pagination.total);
    } catch (err: any) {
      setError(err.message);
      toast({ type: 'error', title: err.message || 'Đã xảy ra lỗi' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchScans(page, search);
  }, [page, search, fetchScans]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const totalBadge = (
    <span className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 text-sm font-medium px-3 py-1.5 rounded-full">
      {total.toLocaleString('vi-VN')} lượt quét
    </span>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch sử quét QR"
        description="Danh sách lượt quét mã QR"
        action={!loading ? totalBadge : undefined}
      />

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo mã QR, tên sản phẩm..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
      </Card>

      {error && (
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
          <div className="text-red-700 dark:text-red-400">{error}</div>
        </Card>
      )}

      {loading ? (
        <Card className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </Card>
      ) : scans.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Chưa có lượt quét</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {search ? 'Không tìm thấy lượt quét phù hợp với bộ lọc' : 'Chưa có lịch sử quét QR nào'}
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">Mã QR</th>
                    <th className="px-4 py-3 font-medium">Sản phẩm</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Thời gian</th>
                    <th className="px-4 py-3 font-medium">IP</th>
                    <th className="px-4 py-3 font-medium">User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan, idx) => (
                    <motion.tr
                      key={scan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3 font-mono text-gray-900 dark:text-gray-100">{scan.qrCode.code}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{scan.product.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDateTime(scan.scannedAt)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{scan.ipAddress || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-[240px] truncate" title={scan.userAgent || ''}>
                        {scan.userAgent || '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
