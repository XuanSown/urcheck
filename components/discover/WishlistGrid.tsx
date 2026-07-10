'use client';
import { useEffect, useState } from 'react';
import { useLocale } from '@/components/I18nProvider';
import { ProductCard } from '@/components/ProductCard';
import { SkeletonGrid, EmptyState } from './DiscoverStates';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

type Product = {
  id: string; name: string; brandName: string; skinType?: string | null;
  imageUrl?: string | null; images?: { url: string; isPrimary?: boolean }[];
  suitableFor?: string[]; tags?: string[]; verified?: boolean; rating?: number | null;
};

export function WishlistGrid() {
  const { t } = useLocale();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/customer/wishlist').then((r) => r.json()).then((data) => {
      if (!active) return;
      if (data.auth) { setAuth(true); setProducts([]); }
      else if (data.success) setProducts(data.products);
      else { setAuth(false); setProducts([]); }
    }).catch(() => { if (active) { setAuth(false); setProducts([]); } });
    return () => { active = false; };
  }, []);

  if (products === null) return <SkeletonGrid />;
  if (auth) return <EmptyState title={t('discover_login_to_view')} action={<Link href="/customer/login"><Button>{t('common_login') || 'Đăng nhập'}</Button></Link>} />;
  if (products.length === 0) return <EmptyState title={t('discover_saved_empty')} />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
