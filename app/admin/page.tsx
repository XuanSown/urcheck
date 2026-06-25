import { Suspense } from 'react';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { formatNumber, formatDate, formatPercent } from '@/lib/format-utils';

// Async component to fetch dashboard data
async function getDashboardData() {
  const [
    totalProducts,
    totalBarcodes,
    totalQrCodes,
    totalQrScans,
    recentScans,
    expiringProducts,
    productsByStatus,
    topQrCodes,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.barcode.count(),
    prisma.qrCode.count({ where: { isActive: true } }),
    prisma.qrCode.aggregate({ _sum: { scanCount: true } }),
    prisma.scanLog.count({
      where: {
        scannedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.product.count({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.product.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.qrCode.findMany({
      where: { isActive: true },
      orderBy: { scanCount: 'desc' },
      take: 5,
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
    }),
  ]);

  // Get scan activity for last 7 days
  const scanActivity = await prisma.scanLog.groupBy({
    by: ['scannedAt'],
    where: {
      scannedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    _count: { id: true },
    orderBy: { scannedAt: 'asc' },
    take: 7,
  });

  // Get top scanned products
  const topScannedProducts = await prisma.product.findMany({
    take: 5,
    orderBy: {
      barcodes: {
        _count: 'desc',
      },
    },
    select: {
      id: true,
      name: true,
      sku: true,
      _count: {
        select: {
          barcodes: true,
        },
      },
    },
  });

  return {
    totalProducts,
    totalBarcodes,
    totalQrCodes,
    totalQrScans: totalQrScans._sum.scanCount || 0,
    recentScans,
    expiringProducts,
    productsByStatus,
    scanActivity,
    topScannedProducts,
    topQrCodes,
  };
}

// Simple bar chart component
function SimpleBarChart({ data }: { data: Array<{ scannedAt: Date; _count: { id: number } }> }) {
  const maxCount = Math.max(...data.map(d => d._count.id), 1);

  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((item, idx) => {
        const height = (item._count.id / maxCount) * 100;
        const date = new Date(item.scannedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-primary-500 rounded-t-sm transition-all hover:bg-primary-600"
              style={{ height: `${height}%`, minHeight: '4px' }}
            />
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        );
      })}
    </div>
  );
}

export async function AdminDashboardPage() {
  await requireAdmin();
  const data = await getDashboardData();

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Tổng quan hệ thống</p>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tổng sản phẩm</CardTitle>
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.totalProducts)}</div>
            <p className="text-xs text-gray-500 mt-1">Sản phẩm trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Mã QR</CardTitle>
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.totalBarcodes)}</div>
            <p className="text-xs text-gray-500 mt-1">Mã duy nhất</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Lượt quét (7 ngày)</CardTitle>
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.recentScans)}</div>
            <p className="text-xs text-gray-500 mt-1">Quét trong 7 ngày qua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Sắp hết hạn</CardTitle>
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatNumber(data.expiringProducts)}</div>
            <p className="text-xs text-gray-500 mt-1">Hết hạn trong 30 ngày</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Mã QR</CardTitle>
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.totalQrCodes)}</div>
            <p className="text-xs text-gray-500 mt-1">Mã QR đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Lượt quét QR</CardTitle>
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-600">{formatNumber(data.totalQrScans)}</div>
            <p className="text-xs text-gray-500 mt-1">Tổng lượt quét QR</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hoạt động quét (7 ngày)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.scanActivity.length > 0 ? (
              <SimpleBarChart data={data.scanActivity} />
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-400">
                Chưa có dữ liệu quét
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products by status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trạng thái sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                data.productsByStatus.reduce((acc, item) => {
                  acc[item.status] = item._count.id;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                    {status}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${(count / data.totalProducts) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top scanned products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sản phẩm được quét nhiều nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topScannedProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-bold text-gray-400 w-5">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">{product._count.barcodes}</p>
                    <p className="text-xs text-gray-500">lượt quét</p>
                  </div>
                </div>
              ))}
              {data.topScannedProducts.length === 0 && (
                <p className="text-center text-gray-400 py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top QR codes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mã QR được quét nhiều nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topQrCodes.map((qr, idx) => (
                <div key={qr.id} className="flex items-center gap-3 p-3 rounded-lg bg-primary-50/50 hover:bg-primary-50 transition-colors border border-primary-100/50">
                  <span className="text-sm font-bold text-primary-300 w-5">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {qr.product?.name ?? 'Sản phẩm đã xoá'}
                    </p>
                    <p className="text-xs font-mono text-primary-700">{qr.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">{formatNumber(qr.scanCount)}</p>
                    <p className="text-xs text-gray-500">lượt quét</p>
                  </div>
                </div>
              ))}
              {data.topQrCodes.length === 0 && (
                <p className="text-center text-gray-400 py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/products/new">
                <Button className="w-full justify-start" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm sản phẩm
                </Button>
              </Link>
              <Link href="/admin/products">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Quản lý sản phẩm
                </Button>
              </Link>
              <Link href="/admin/products?status=draft">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Bản nháp
                </Button>
              </Link>
              <Link href="/" target="_blank">
                <Button variant="ghost" className="w-full justify-start" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Xem trang công khai
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Wrap with Suspense for async component
export default function AdminDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDashboardPage />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
