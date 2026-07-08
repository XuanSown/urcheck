'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from '@/components/I18nProvider';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar } from '@/components/FilterBar';

type Product = {
  id: string;
  name: string;
  brandName: string;
  skinType?: string | null;
  imageUrl?: string | null;
  suitableFor?: string[];
  tags?: string[];
};

export default function DiscoverPage() {
  const { locale, t } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [skinType, setSkinType] = useState<string | undefined>();
  const [brand, setBrand] = useState<string | undefined>();

  const fetchFeed = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '12' });
      if (skinType) params.set('skinType', skinType);
      if (brand) params.set('brand', brand);
      const res = await fetch(`/api/feed?${params.toString()}`, { headers: { 'Accept-Language': locale } });
      const data = await res.json();
      if (data.success) {
        const next = data.products;
        setProducts((prev) => (reset ? next : [...prev, ...next]));
        setTotal(data.pagination.total);
        setHasMore(data.pagination.page * data.pagination.limit < data.pagination.total);
        setPage(data.pagination.page);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [locale, skinType, brand]);

  useEffect(() => {
    fetchFeed(1, true);
  }, [fetchFeed]);

  const loadMore = () => fetchFeed(page + 1);

  const resetFilters = () => {
    setSkinType(undefined);
    setBrand(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('feed_title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('feed_subtitle')}</p>
        </div>

        <FilterBar
          skinType={skinType}
          brand={brand}
          onSkinTypeChange={setSkinType}
          onBrandChange={setBrand}
          onReset={resetFilters}
        />

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">{t('feed_empty')}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 text-center">
                <button onClick={loadMore} disabled={loading} className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                  {loading ? '...' : t('feed_load_more')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
