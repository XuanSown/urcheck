'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/I18nProvider';
import { ProductCard } from '@/components/ProductCard';
import { SkeletonGrid, ErrorState } from './DiscoverStates';

type Product = {
  id: string; name: string; brandName: string; skinType?: string | null;
  imageUrl?: string | null; images?: { url: string; isPrimary?: boolean }[];
  suitableFor?: string[]; tags?: string[]; verified?: boolean; rating?: number | null;
};

export function DiscoverFeed({ skinType, brand }: { skinType?: string; brand?: string }) {
  const { locale, t } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const load = useCallback(async (cur: string | null, replace: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '12' });
      if (cur) params.set('cursor', cur);
      if (skinType) params.set('skinType', skinType);
      if (brand) params.set('brand', brand);
      const res = await fetch(`/api/feed?${params.toString()}`, { headers: { 'Accept-Language': locale } });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => (replace ? data.products : [...prev, ...data.products]));
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else throw new Error();
    } catch {
      setError(t('feed_error') || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  }, [locale, skinType, brand, t]);

  useEffect(() => { load(null, true); }, [load]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) load(cursor, false);
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, cursor, load]);

  if (loading && products.length === 0) return <SkeletonGrid />;
  if (error && products.length === 0) return <ErrorState message={error} onRetry={() => load(null, true)} />;
  if (products.length === 0) return <p className="text-center text-gray-500 py-12">{t('feed_empty')}</p>;

  return (
    <div aria-busy={loading}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      <div ref={sentinel} aria-live="polite" className="h-10 mt-4 text-center text-sm text-gray-400">
        {loading && products.length > 0 ? (t('feed_loading_more') || 'Đang tải thêm…') : hasMore ? '' : (t('feed_end') || 'Đã hiển thị tất cả')}
      </div>
    </div>
  );
}
