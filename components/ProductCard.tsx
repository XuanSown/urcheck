'use client';

import { useLocale } from '@/components/I18nProvider';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { primaryImageUrl } from '@/lib/product-utils';

type Product = {
  id: string;
  name: string;
  brandName: string;
  skinType?: string | null;
  imageUrl?: string | null;
  images?: { url: string; isPrimary?: boolean }[];
  suitableFor?: string[];
  tags?: string[];
};

export function ProductCard({ product, onWishlistChange }: { product: Product; onWishlistChange?: (id: string) => void }) {
  const { t } = useLocale();
  const { customer } = useCustomerAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [wishloading, setWishloading] = useState(false);
  const [wishError, setWishError] = useState<string | null>(null);

  const handleWishlist = async () => {
    if (!customer) return;
    setWishloading(true);
    setWishError(null);
    try {
      const res = await fetch('/api/customer/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (data.success) {
        setWishlisted(!wishlisted);
        onWishlistChange?.(product.id);
      }
    } catch {
      setWishError(t('wishlist_error') || 'Không thể lưu, vui lòng thử lại');
    } finally {
      setWishloading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex flex-col">
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
        {primaryImageUrl(product.images) ? (
          <img src={primaryImageUrl(product.images)!} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No image</div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.brandName}</p>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
        {product.skinType && (
          <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300">
            {product.skinType}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <a
            href={`/?q=${product.id}`}
            className="flex-1 text-center text-xs py-2.5 rounded-xl border-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] inline-flex items-center justify-center transition-colors"
          >
            {t('common_scan') || 'Quét'}
          </a>
          <Button
            onClick={handleWishlist}
            loading={wishloading}
            variant={wishlisted ? 'danger' : 'outline'}
            size="md"
            className="flex-1"
          >
            {wishlisted ? (t('wishlist_remove') || 'Đã lưu') : (t('wishlist_add') || 'Lưu')}
          </Button>
        </div>
        {wishError && (
          <p className="text-xs text-red-600 dark:text-red-400" role="alert">{wishError}</p>
        )}
      </div>
    </div>
  );
}
