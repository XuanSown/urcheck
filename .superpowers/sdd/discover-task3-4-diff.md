diff --git a/components/ProductCard.tsx b/components/ProductCard.tsx
index 39f1a40..2ba4e26 100644
--- a/components/ProductCard.tsx
+++ b/components/ProductCard.tsx
@@ -3,6 +3,7 @@
 import { useLocale } from '@/components/I18nProvider';
 import { useCustomerAuth } from '@/components/CustomerAuth';
 import { useState } from 'react';
+import { useReducedMotion } from 'framer-motion';
 import { Button } from '@/components/ui/Button';
 import { primaryImageUrl } from '@/lib/product-utils';
 
@@ -10,6 +11,8 @@ type Product = {
   id: string;
   name: string;
   brandName: string;
+  verified?: boolean;
+  rating?: number | null;
   skinType?: string | null;
   imageUrl?: string | null;
   images?: { url: string; isPrimary?: boolean }[];
@@ -20,6 +23,7 @@ type Product = {
 export function ProductCard({ product, onWishlistChange }: { product: Product; onWishlistChange?: (id: string) => void }) {
   const { t } = useLocale();
   const { customer } = useCustomerAuth();
+  const reduced = useReducedMotion();
   const [wishlisted, setWishlisted] = useState(false);
   const [wishloading, setWishloading] = useState(false);
   const [wishError, setWishError] = useState<string | null>(null);
@@ -47,7 +51,7 @@ export function ProductCard({ product, onWishlistChange }: { product: Product; o
   };
 
   return (
-    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex flex-col">
+    <div className={`group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex flex-col transition-all duration-200 ${reduced ? '' : 'hover:-translate-y-1 hover:shadow-lg'}`}>
       <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
         {primaryImageUrl(product.images) ? (
           <img src={primaryImageUrl(product.images)!} alt={product.name} className="w-full h-full object-cover" />
@@ -63,6 +67,20 @@ export function ProductCard({ product, onWishlistChange }: { product: Product; o
             {product.skinType}
           </span>
         )}
+        {product.verified && (
+          <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
+            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
+            {t('discover_verified')}
+          </span>
+        )}
+        {product.rating != null && (
+          <div className="flex items-center gap-1 mt-2 text-amber-500" aria-label={`${t('discover_rating')}: ${product.rating}`}>
+            {Array.from({ length: 5 }).map((_, i) => (
+              <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating!) ? 'fill-amber-400' : 'fill-gray-300 dark:fill-gray-700'}`} viewBox="0 0 20 20"><path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.5 4.6h4.85c.97 0 1.37 1.24.59 1.8l-3.92 2.85 1.5 4.6c.3.92-.75 1.69-1.54 1.13L10 15.4l-3.83 2.7c-.79.56-1.84-.21-1.54-1.13l1.5-4.6L2.2 9.33c-.78-.56-.38-1.8.59-1.8h4.85l1.5-4.6z" /></svg>
+            ))}
+            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{product.rating}</span>
+          </div>
+        )}
       </div>
       <div className="mt-3 flex flex-col gap-2">
         <div className="flex items-center gap-2">
diff --git a/lib/i18n.ts b/lib/i18n.ts
index 2b90a6a..94129c3 100644
--- a/lib/i18n.ts
+++ b/lib/i18n.ts
@@ -166,7 +166,19 @@ feed_title: 'Khám phá sản phẩm',
 feed_subtitle: 'Gợi ý dành riêng cho bạn',
 feed_empty: 'Chưa có sản phẩm phù hợp',
 feed_load_more: 'Tải thêm',
-feed_filter_skin: 'Loại da',
+    discover_tab_discover: 'Khám phá',
+    discover_tab_saved: 'Đã lưu',
+    discover_saved_title: 'Sản phẩm đã lưu',
+    discover_saved_empty: 'Bạn chưa lưu sản phẩm nào',
+    discover_login_to_view: 'Đăng nhập để xem danh sách đã lưu',
+    discover_verified: 'Đã xác minh',
+    discover_rating: 'Đánh giá',
+    feed_load_error_retry: 'Thử lại',
+    filter_clear: 'Xoá bộ lọc',
+    feed_loading_more: 'Đang tải thêm…',
+    feed_end: 'Đã hiển thị tất cả',
+    common_login: 'Đăng nhập',
+    feed_filter_skin: 'Loại da',
 feed_filter_brand: 'Thương hiệu...',
 feed_filter_reset: 'Bỏ lọc',
 skin_normal: 'Da thường',
@@ -543,7 +555,19 @@ feed_title: 'Discover Products',
 feed_subtitle: 'Personalized for you',
 feed_empty: 'No products match your profile',
 feed_load_more: 'Load more',
-feed_filter_skin: 'Skin type',
+    discover_tab_discover: 'Discover',
+    discover_tab_saved: 'Saved',
+    discover_saved_title: 'Saved products',
+    discover_saved_empty: 'You have not saved any products yet',
+    discover_login_to_view: 'Sign in to view your saved list',
+    discover_verified: 'Verified',
+    discover_rating: 'Rating',
+    feed_load_error_retry: 'Retry',
+    filter_clear: 'Clear filters',
+    feed_loading_more: 'Loading more…',
+    feed_end: 'You have seen everything',
+    common_login: 'Sign in',
+    feed_filter_skin: 'Skin type',
 feed_filter_brand: 'Brand...',
 feed_filter_reset: 'Clear',
 skin_normal: 'Normal',
