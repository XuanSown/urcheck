export type HistoryItem = {
  scannedAt: string;
  isValid: boolean;
  status: 'valid' | 'expired' | 'unverified';
  product: {
    id: string;
    name: string;
    brandName: string;
    imageUrl: string | null;
    images?: { url: string; isPrimary?: boolean }[];
    verified: boolean;
    expiryDate: string | null;
  } | null;
  qrCode: string;
};

import { primaryImageUrl } from '@/lib/product-utils';

const statusConfig = {
  valid: {
    label: 'Hợp lệ',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dot: 'bg-green-500',
  },
  expired: {
    label: 'Hết hạn',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
  },
  unverified: {
    label: 'Chưa xác minh',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    dot: 'bg-gray-400',
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CustomerHistoryList({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4">
        <svg className="w-14 h-14 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
        <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">Chưa có lịch sử quét</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">Hãy quét mã QR trên sản phẩm để kiểm tra độ xác thực và theo dõi lịch sử tại đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const status = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.unverified;
        return (
          <div
            key={`${item.qrCode}-${item.scannedAt}`}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              {primaryImageUrl(item.product?.images) ? (
                <img
                  src={primaryImageUrl(item.product?.images)!}
                  alt={item.product?.name}
                  className="w-14 h-14 rounded-lg object-cover bg-gray-100 dark:bg-gray-800"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {item.product?.name || 'Sản phẩm không xác định'}
                </h3>
                {item.product?.brandName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.product.brandName}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatDate(item.scannedAt)}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
