'use client';

import { Suspense, useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '@/lib/format-utils';
import { primaryImageUrl } from '@/lib/product-utils';

interface Product {
  id: string;
  name: string;
  description?: string;
  manufactureDate?: string | null;
  expiryDate?: string | null;
  expiresInMonths?: number | null;
  skinType?: string;
  suitableFor?: string;
  pros: string[];
  cons: string[];
  tags: string[];
  status: string;
  companyName: string;
  verified: boolean;
  createdAt: string;
  versionCount: number;
  qrCode: {
    code: string;
    url: string;
  } | null;
  images: { id: string; url: string; isPrimary: boolean }[];
  imageUrl?: string | null;
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <AdminProductsInner />
    </Suspense>
  );
}

function ProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function AdminProductsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const fetchProducts = useCallback(async (pageNum: number, searchQuery: string, status: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi tải dữ liệu');
      }

      setProducts(data.data.products);
      setTotalPages(data.data.pagination.totalPages);
      setTotal(data.data.pagination.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page, search, statusFilter);
  }, [page, search, statusFilter, fetchProducts]);

  // Update URL when filters change
  const updateFilters = (newSearch: string, newStatus: string, newPage: number = 1) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newStatus) params.set('status', newStatus);
    if (newPage > 1) params.set('page', newPage.toString());

    startTransition(() => {
      router.push(`/admin/products?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(search, statusFilter, 1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    updateFilters(search, newStatus, 1);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
    setShowBulkActions(selectedIds.length > 0 || products.length > 0);
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    const nonArchivedCount = products.filter(p => selectedIds.includes(p.id) && p.status !== 'ARCHIVED').length;
    if (nonArchivedCount > 0) {
      alert(`Trong số ${selectedIds.length} sản phẩm đã chọn, có ${nonArchivedCount} sản phẩm chưa được lưu trữ.\n\nChỉ những sản phẩm có trạng thái Đã lưu trữ (ARCHIVED) mới có thể bị xóa. Vui lòng chuyển trạng thái trước khi xóa!`);
      return;
    }

    if (!confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const promises = selectedIds.map(id =>
        fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      );
      const results = await Promise.all(promises);

      const failed = results.filter(r => !r.ok);
      if (failed.length > 0) {
        alert(`Có ${failed.length} sản phẩm không thể xóa`);
      }

      // Refresh list
      fetchProducts(page, search, statusFilter);
      setSelectedIds([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Đã xảy ra lỗi khi xóa sản phẩm');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
      PUBLISHED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      ARCHIVED: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    };
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  };

  const statusCounts = products.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý sản phẩm</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý tất cả sản phẩm trong hệ thống</p>
        </div>
        <Link href="/admin/products/new">
          <Button size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên, công ty..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-950"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>
        </div>

        {/* Status quick filters */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => updateFilters(search, '', 1)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!statusFilter ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:bg-gray-800'}`}
          >
            Tất cả ({total})
          </button>
          {Object.entries({
            PUBLISHED: 'Đã xuất bản',
            DRAFT: 'Bản nháp',
            ARCHIVED: 'Đã lưu trữ',
          }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => updateFilters(search, key, 1)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === key ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:bg-gray-800'}`}
            >
              {label} ({statusCounts[key] || 0})
            </button>
          ))}
        </div>
      </Card>

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.length === products.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm font-medium text-primary-900">
                Đã chọn {selectedIds.length} sản phẩm
              </span>
            </div>
            <div className="h-6 w-px bg-primary-200" />
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isPending}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa đã chọn
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
          <div className="text-red-700 dark:text-red-400">{error}</div>
        </Card>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Chưa có sản phẩm</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {search || statusFilter ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc' : 'Hãy thêm sản phẩm đầu tiên'}
          </p>
          <Link href="/admin/products/new">
            <Button>Thêm sản phẩm</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-all h-full flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images.find(img => img.isPrimary)?.url || product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : primaryImageUrl(product.images) ? (
                      <img
                        src={primaryImageUrl(product.images)!}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                        <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => handleSelectOne(product.id)}
                        className="w-4 h-4"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(product.status)}`}>
                        {product.status === 'DRAFT' ? 'Nháp' : product.status === 'PUBLISHED' ? 'Xuất bản' : 'Lưu trữ'}
                      </span>
                    </div>
                    {!product.verified && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="bg-red-50 dark:bg-red-900/20 text-white text-xs px-2 py-1 rounded">
                          Chưa xác minh
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 flex-1 pt-1">{product.name}</h3>
                      {product.qrCode && (
                        <div className="flex-shrink-0" title={`Mã QR: ${product.qrCode.code}`}>
                          <Link href={`/?q=${product.qrCode.code}`} target="_blank" className="block bg-white p-1 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all">
                            <QRCodeSVG value={product.qrCode.url} size={44} />
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span>{product.versionCount} phiên bản</span>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(product.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="ghost" size="sm" aria-label="Chỉnh sửa">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateFilters(search, statusFilter, page - 1)}
              >
                Trước
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-600 dark:text-gray-400">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => updateFilters(search, statusFilter, page + 1)}
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
