'use client';

import { useLocale } from '@/components/I18nProvider';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { primaryImageUrl } from '@/lib/product-utils';

type Product = {
  id: string;
  name: string;
  brandName: string;
  verified?: boolean;
  rating?: number | null;
  skinType?: string | null;
  imageUrl?: string | null;
  images?: { url: string; isPrimary?: boolean }[];
  suitableFor?: string[];
  tags?: string[];
};

export function ProductCard({ product, onWishlistChange }: { product: Product; onWishlistChange?: (id: string) => void }) {
  const { t } = useLocale();
  const { customer } = useCustomerAuth();
  const reduced = useReducedMotion();
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
    <div className={`group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex flex-col transition-all duration-200 ${reduced ? '' : 'hover:-translate-y-1 hover:shadow-lg'}`}>
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
        {product.verified && (
          <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {t('discover_verified')}
          </span>
        )}
        {product.rating != null && (
          <div className="flex items-center gap-1 mt-2 text-amber-500" aria-label={`${t('discover_rating')}: ${product.rating}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating!) ? 'fill-amber-400' : 'fill-gray-300 dark:fill-gray-700'}`} viewBox="0 0 20 20"><path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.5 4.6h4.85c.97 0 1.37 1.24.59 1.8l-3.92 2.85 1.5 4.6c.3.92-.75 1.69-1.54 1.13L10 15.4l-3.83 2.7c-.79.56-1.84-.21-1.54-1.13l1.5-4.6L2.2 9.33c-.78-.56-.38-1.8.59-1.8h4.85l1.5-4.6z" /></svg>
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{product.rating}</span>
          </div>
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
