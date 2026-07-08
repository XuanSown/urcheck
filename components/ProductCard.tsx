'use client';

import { useLocale } from '@/components/I18nProvider';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { useState } from 'react';

type Product = {
  id: string;
  name: string;
  brandName: string;
  skinType?: string | null;
  imageUrl?: string | null;
  suitableFor?: string[];
  tags?: string[];
};

export function ProductCard({ product, onWishlistChange }: { product: Product; onWishlistChange?: (id: string) => void }) {
  const { t } = useLocale();
  const { customer } = useCustomerAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [wishloading, setWishloading] = useState(false);

  const handleWishlist = async () => {
    if (!customer) return;
    setWishloading(true);
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
      // silent
    } finally {
      setWishloading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex flex-col">
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No image</div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.brandName}</p>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
        {product.skinType && (
          <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
            {product.skinType}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <a
          href={`/?q=${product.id}`}
          className="flex-1 text-center text-xs py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {t('common_scan') || 'Quét'}
        </a>
        <button
          onClick={handleWishlist}
          disabled={wishloading}
          className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${
            wishlisted
              ? 'border-red-200 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {wishlisted ? (t('wishlist_remove') || 'Đã lưu') : (t('wishlist_add') || 'Lưu')}
        </button>
      </div>
    </div>
  );
}
