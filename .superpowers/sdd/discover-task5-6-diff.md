diff --git a/app/discover/page.tsx b/app/discover/page.tsx
index 38f4df5..236e1c1 100644
--- a/app/discover/page.tsx
+++ b/app/discover/page.tsx
@@ -1,113 +1,54 @@
 'use client';
 
-import { useEffect, useState, useCallback } from 'react';
+import { useState } from 'react';
+import { motion, useReducedMotion } from 'framer-motion';
 import { useLocale } from '@/components/I18nProvider';
-import { ProductCard } from '@/components/ProductCard';
 import { FilterBar } from '@/components/FilterBar';
-import { Button } from '@/components/ui/Button';
-
-type Product = {
-  id: string;
-  name: string;
-  brandName: string;
-  skinType?: string | null;
-  imageUrl?: string | null;
-  suitableFor?: string[];
-  tags?: string[];
-};
+import { DiscoverFeed } from '@/components/discover/DiscoverFeed';
+import { WishlistGrid } from '@/components/discover/WishlistGrid';
 
 export default function DiscoverPage() {
-  const { locale, t } = useLocale();
-  const [products, setProducts] = useState<Product[]>([]);
-  const [loading, setLoading] = useState(true);
-  const [page, setPage] = useState(1);
-  const [total, setTotal] = useState(0);
-  const [hasMore, setHasMore] = useState(false);
+  const { t } = useLocale();
+  const reduced = useReducedMotion();
+  const [tab, setTab] = useState<'discover' | 'saved'>('discover');
   const [skinType, setSkinType] = useState<string | undefined>();
   const [brand, setBrand] = useState<string | undefined>();
-  const [error, setError] = useState<string | null>(null);
-
-  const fetchFeed = useCallback(async (p = 1, reset = false) => {
-    setLoading(true);
-    setError(null);
-    try {
-      const params = new URLSearchParams({ page: String(p), limit: '12' });
-      if (skinType) params.set('skinType', skinType);
-      if (brand) params.set('brand', brand);
-      const res = await fetch(`/api/feed?${params.toString()}`, { headers: { 'Accept-Language': locale } });
-      const data = await res.json();
-      if (data.success) {
-        const next = data.products;
-        setProducts((prev) => (reset ? next : [...prev, ...next]));
-        setTotal(data.pagination.total);
-        setHasMore(data.pagination.page * data.pagination.limit < data.pagination.total);
-        setPage(data.pagination.page);
-      }
-    } catch {
-      setError(t('feed_error') || 'Đã xảy ra lỗi khi tải dữ liệu, vui lòng thử lại');
-    } finally {
-      setLoading(false);
-    }
-  }, [locale, skinType, brand]);
-
-  useEffect(() => {
-    fetchFeed(1, true);
-  }, [fetchFeed]);
-
-  const loadMore = () => fetchFeed(page + 1);
 
-  const resetFilters = () => {
-    setSkinType(undefined);
-    setBrand(undefined);
-  };
+  const tabs = [
+    { key: 'discover' as const, label: t('discover_tab_discover') },
+    { key: 'saved' as const, label: t('discover_tab_saved') },
+  ];
 
   return (
     <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
       <div className="max-w-6xl mx-auto">
-        <div className="mb-8">
-          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('feed_title')}</h1>
-          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('feed_subtitle')}</p>
+        <motion.div initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}>
+          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tab === 'saved' ? t('discover_saved_title') : t('feed_title')}</h1>
+          <p className="text-gray-600 dark:text-gray-400 mt-1">{tab === 'saved' ? '' : t('feed_subtitle')}</p>
+        </motion.div>
+
+        <div className="flex gap-1 mt-6 border-b border-gray-200 dark:border-gray-800" role="tablist" aria-label="discover tabs">
+          {tabs.map((tb) => (
+            <button
+              key={tb.key}
+              role="tab"
+              aria-selected={tab === tb.key}
+              onClick={() => setTab(tb.key)}
+              className={`relative px-4 py-2 text-sm font-medium ${tab === tb.key ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
+            >
+              {tb.label}
+              {tab === tb.key && <motion.span layoutId="discover-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary-600 dark:bg-primary-400" />}
+            </button>
+          ))}
         </div>
 
-        <FilterBar
-          skinType={skinType}
-          brand={brand}
-          onSkinTypeChange={setSkinType}
-          onBrandChange={setBrand}
-          onReset={resetFilters}
-        />
-
-        {loading && products.length === 0 ? (
-          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
-            {Array.from({ length: 8 }).map((_, i) => (
-              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
-                <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl mb-3" />
-                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
-                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
-              </div>
-            ))}
-          </div>
-        ) : products.length === 0 ? (
-          <p className="text-center text-gray-500 py-12">{t('feed_empty')}</p>
-        ) : error ? (
-          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-start gap-3" role="alert">
-            <p className="text-red-700 dark:text-red-400">{error}</p>
-          </div>
-        ) : (
+        {tab === 'discover' ? (
           <>
-            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
-              {products.map((p) => (
-                <ProductCard key={p.id} product={p} />
-              ))}
-            </div>
-            {hasMore && (
-              <div className="mt-8 text-center">
-                <Button onClick={loadMore} loading={loading} size="lg">
-                  {t('feed_load_more')}
-                </Button>
-              </div>
-            )}
+            <FilterBar skinType={skinType} brand={brand} onSkinTypeChange={setSkinType} onBrandChange={setBrand} onReset={() => { setSkinType(undefined); setBrand(undefined); }} />
+            <DiscoverFeed skinType={skinType} brand={brand} />
           </>
+        ) : (
+          <div className="pt-6"><WishlistGrid /></div>
         )}
       </div>
     </div>
diff --git a/components/FilterBar.tsx b/components/FilterBar.tsx
index 04edf26..68859ce 100644
--- a/components/FilterBar.tsx
+++ b/components/FilterBar.tsx
@@ -1,5 +1,6 @@
 'use client';
 
+import { motion, useReducedMotion } from 'framer-motion';
 import { useLocale } from '@/components/I18nProvider';
 
 export function FilterBar({
@@ -16,44 +17,68 @@ export function FilterBar({
   onReset: () => void;
 }) {
   const { t } = useLocale();
+  const reduced = useReducedMotion();
+  const hasFilter = Boolean(skinType || brand);
 
   return (
-    <div className="flex flex-wrap gap-3 mb-6">
-      <label htmlFor="filter-skin-type" className="sr-only">
-        {t('feed_filter_skin') || 'Lọc theo loại da'}
-      </label>
-      <select
-        id="filter-skin-type"
-        value={skinType ?? ''}
-        onChange={(e) => onSkinTypeChange(e.target.value || undefined)}
-        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
-      >
-        <option value="">{t('feed_filter_skin') || 'Loại da'}</option>
-        <option value="normal">{t('skin_normal') || 'Thường'}</option>
-        <option value="oily">{t('skin_oily') || 'Dầu'}</option>
-        <option value="dry">{t('skin_dry') || 'Khô'}</option>
-        <option value="combination">{t('skin_combination') || 'Hỗn hợp'}</option>
-        <option value="sensitive">{t('skin_sensitive') || 'Nhạy cảm'}</option>
-      </select>
-      <label htmlFor="filter-brand" className="sr-only">
-        {t('feed_filter_brand') || 'Tìm kiếm theo thương hiệu'}
-      </label>
-      <input
-        id="filter-brand"
-        type="text"
-        value={brand ?? ''}
-        onChange={(e) => onBrandChange(e.target.value || undefined)}
-        placeholder={t('feed_filter_brand') || 'Thương hiệu...'}
-        aria-label={t('feed_filter_brand') || 'Tìm kiếm theo thương hiệu'}
-        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
-      />
-      <button
-        onClick={onReset}
-        aria-label={t('feed_filter_reset') || 'Bỏ lọc'}
-        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
-      >
-        {t('feed_filter_reset') || 'Bỏ lọc'}
-      </button>
-    </div>
+    <motion.div
+      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
+      animate={{ opacity: 1, y: 0 }}
+      transition={{ duration: reduced ? 0 : 0.25 }}
+      className="sticky top-0 z-10 -mx-4 px-4 py-3 mb-6 backdrop-blur bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800"
+    >
+      <div className="flex flex-wrap items-center gap-3">
+        <label htmlFor="filter-skin-type" className="sr-only">
+          {t('feed_filter_skin') || 'Lọc theo loại da'}
+        </label>
+        <select
+          id="filter-skin-type"
+          value={skinType ?? ''}
+          onChange={(e) => onSkinTypeChange(e.target.value || undefined)}
+          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
+        >
+          <option value="">{t('feed_filter_skin') || 'Loại da'}</option>
+          <option value="normal">{t('skin_normal') || 'Thường'}</option>
+          <option value="oily">{t('skin_oily') || 'Dầu'}</option>
+          <option value="dry">{t('skin_dry') || 'Khô'}</option>
+          <option value="combination">{t('skin_combination') || 'Hỗn hợp'}</option>
+          <option value="sensitive">{t('skin_sensitive') || 'Nhạy cảm'}</option>
+        </select>
+        <label htmlFor="filter-brand" className="sr-only">
+          {t('feed_filter_brand') || 'Tìm kiếm theo thương hiệu'}
+        </label>
+        <input
+          id="filter-brand"
+          type="text"
+          value={brand ?? ''}
+          onChange={(e) => onBrandChange(e.target.value || undefined)}
+          placeholder={t('feed_filter_brand') || 'Thương hiệu...'}
+          aria-label={t('feed_filter_brand') || 'Tìm kiếm theo thương hiệu'}
+          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
+        />
+
+        {skinType && (
+          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">
+            {skinType}
+            <button onClick={() => onSkinTypeChange(undefined)} aria-label="Xoá lọc loại da" className="ml-0.5 text-primary-500 hover:text-primary-700">✕</button>
+          </span>
+        )}
+        {brand && (
+          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">
+            {brand}
+            <button onClick={() => onBrandChange(undefined)} aria-label="Xoá lọc thương hiệu" className="ml-0.5 text-primary-500 hover:text-primary-700">✕</button>
+          </span>
+        )}
+
+        {hasFilter && (
+          <button
+            onClick={onReset}
+            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
+          >
+            {t('filter_clear')}
+          </button>
+        )}
+      </div>
+    </motion.div>
   );
 }
diff --git a/components/discover/DiscoverFeed.tsx b/components/discover/DiscoverFeed.tsx
new file mode 100644
index 0000000..b96e6bc
--- /dev/null
+++ b/components/discover/DiscoverFeed.tsx
@@ -0,0 +1,87 @@
+'use client';
+import { useCallback, useEffect, useRef, useState } from 'react';
+import { useLocale } from '@/components/I18nProvider';
+import { ProductCard } from '@/components/ProductCard';
+import { SkeletonGrid, ErrorState } from './DiscoverStates';
+
+type Product = {
+  id: string; name: string; brandName: string; skinType?: string | null;
+  imageUrl?: string | null; images?: { url: string; isPrimary?: boolean }[];
+  suitableFor?: string[]; tags?: string[]; verified?: boolean; rating?: number | null;
+};
+
+export function DiscoverFeed({ skinType, brand }: { skinType?: string; brand?: string }) {
+  const { locale, t } = useLocale();
+  const [products, setProducts] = useState<Product[]>([]);
+  const [cursor, setCursor] = useState<string | null>(null);
+  const [loading, setLoading] = useState(true);
+  const [error, setError] = useState<string | null>(null);
+  const [hasMore, setHasMore] = useState(false);
+  const sentinel = useRef<HTMLDivElement>(null);
+
+  const load = useCallback(async (cur: string | null, replace: boolean) => {
+    setLoading(true);
+    setError(null);
+    try {
+      const params = new URLSearchParams({ limit: '12' });
+      if (cur) params.set('cursor', cur);
+      if (skinType) params.set('skinType', skinType);
+      if (brand) params.set('brand', brand);
+      const res = await fetch(`/api/feed?${params.toString()}`, { headers: { 'Accept-Language': locale } });
+      const data = await res.json();
+      if (data.success) {
+        setProducts((prev) => (replace ? data.products : [...prev, ...data.products]));
+        setCursor(data.nextCursor);
+        setHasMore(data.hasMore);
+      } else throw new Error();
+    } catch {
+      setError(t('feed_error') || 'Đã xảy ra lỗi, vui lòng thử lại');
+    } finally {
+      setLoading(false);
+    }
+  }, [locale, skinType, brand, t]);
+
+  useEffect(() => {
+    let active = true;
+    (async () => {
+      setLoading(true); setError(null);
+      try {
+        const params = new URLSearchParams({ limit: '12' });
+        if (skinType) params.set('skinType', skinType);
+        if (brand) params.set('brand', brand);
+        const res = await fetch(`/api/feed?${params.toString()}`, { headers: { 'Accept-Language': locale } });
+        const data = await res.json();
+        if (data.success && active) {
+          setProducts(data.products); setCursor(data.nextCursor); setHasMore(data.hasMore);
+        } else if (active) setError(t('feed_error') || 'Đã xảy ra lỗi, vui lòng thử lại');
+      } catch { if (active) setError(t('feed_error') || 'Đã xảy ra lỗi, vui lòng thử lại'); }
+      finally { if (active) setLoading(false); }
+    })();
+    return () => { active = false; };
+  }, [locale, t, skinType, brand]);
+
+  useEffect(() => {
+    const el = sentinel.current;
+    if (!el) return;
+    const io = new IntersectionObserver((entries) => {
+      if (entries[0].isIntersecting && hasMore && !loading) load(cursor, false);
+    }, { rootMargin: '200px' });
+    io.observe(el);
+    return () => io.disconnect();
+  }, [hasMore, loading, cursor, load]);
+
+  if (loading && products.length === 0) return <SkeletonGrid />;
+  if (error && products.length === 0) return <ErrorState message={error} onRetry={() => load(null, true)} />;
+  if (products.length === 0) return <p className="text-center text-gray-500 py-12">{t('feed_empty')}</p>;
+
+  return (
+    <div aria-busy={loading}>
+      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
+        {products.map((p) => <ProductCard key={p.id} product={p} />)}
+      </div>
+      <div ref={sentinel} aria-live="polite" className="h-10 mt-4 text-center text-sm text-gray-400">
+        {loading && products.length > 0 ? (t('feed_loading_more') || 'Đang tải thêm…') : hasMore ? '' : (t('feed_end') || 'Đã hiển thị tất cả')}
+      </div>
+    </div>
+  );
+}
diff --git a/components/discover/DiscoverStates.tsx b/components/discover/DiscoverStates.tsx
new file mode 100644
index 0000000..5ac936a
--- /dev/null
+++ b/components/discover/DiscoverStates.tsx
@@ -0,0 +1,37 @@
+'use client';
+import { useLocale } from '@/components/I18nProvider';
+
+export function SkeletonGrid({ count = 8 }: { count?: number }) {
+  return (
+    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" aria-hidden="true">
+      {Array.from({ length: count }).map((_, i) => (
+        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
+          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl mb-3" />
+          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
+          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
+        </div>
+      ))}
+    </div>
+  );
+}
+
+export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
+  return (
+    <div className="text-center py-16">
+      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
+      <p className="text-lg font-medium text-gray-900 dark:text-white">{title}</p>
+      {hint && <p className="text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
+      {action && <div className="mt-4 flex justify-center">{action}</div>}
+    </div>
+  );
+}
+
+export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
+  const { t } = useLocale();
+  return (
+    <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-center justify-between gap-3" role="alert">
+      <p className="text-red-700 dark:text-red-400">{message}</p>
+      <button onClick={onRetry} className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">{t('feed_load_error_retry')}</button>
+    </div>
+  );
+}
diff --git a/components/discover/WishlistGrid.tsx b/components/discover/WishlistGrid.tsx
new file mode 100644
index 0000000..2f81ff9
--- /dev/null
+++ b/components/discover/WishlistGrid.tsx
@@ -0,0 +1,40 @@
+'use client';
+import { useEffect, useState } from 'react';
+import { useLocale } from '@/components/I18nProvider';
+import { ProductCard } from '@/components/ProductCard';
+import { SkeletonGrid, EmptyState } from './DiscoverStates';
+import { Button } from '@/components/ui/Button';
+import Link from 'next/link';
+
+type Product = {
+  id: string; name: string; brandName: string; skinType?: string | null;
+  imageUrl?: string | null; images?: { url: string; isPrimary?: boolean }[];
+  suitableFor?: string[]; tags?: string[]; verified?: boolean; rating?: number | null;
+};
+
+export function WishlistGrid() {
+  const { t } = useLocale();
+  const [products, setProducts] = useState<Product[] | null>(null);
+  const [auth, setAuth] = useState(false);
+
+  useEffect(() => {
+    let active = true;
+    fetch('/api/customer/wishlist').then((r) => r.json()).then((data) => {
+      if (!active) return;
+      if (data.auth) { setAuth(true); setProducts([]); }
+      else if (data.success) setProducts(data.products);
+      else { setAuth(false); setProducts([]); }
+    }).catch(() => { if (active) { setAuth(false); setProducts([]); } });
+    return () => { active = false; };
+  }, []);
+
+  if (products === null) return <SkeletonGrid />;
+  if (auth) return <EmptyState title={t('discover_login_to_view')} action={<Link href="/customer/login"><Button>{t('common_login') || 'Đăng nhập'}</Button></Link>} />;
+  if (products.length === 0) return <EmptyState title={t('discover_saved_empty')} />;
+
+  return (
+    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
+      {products.map((p) => <ProductCard key={p.id} product={p} />)}
+    </div>
+  );
+}
