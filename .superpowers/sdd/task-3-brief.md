# Task 3: ProductPicker component

**File to create:** `components/ProductPicker.tsx` (client component)

Code verbatim từ plan (copy nguyên):

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/I18nProvider';

export type PickedProduct = {
  productId: string;
  productName: string;
  brandName?: string | null;
  imageUrl?: string | null;
};

export function ProductPicker({
  value,
  onChange,
}: {
  value: PickedProduct | null;
  onChange: (p: PickedProduct) => void;
}) {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PickedProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(query)}&limit=8`,
          { headers: { 'Accept-Language': locale }, signal: ctrl.signal }
        );
        const data = await res.json();
        if (data.success) setResults(data.products);
      } catch {
        // ignore abort
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [query, locale]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (value) {
    return (
      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
        {value.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
        ) : null}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value.productName}</p>
          {value.brandName && (
            <p className="text-xs text-gray-500 truncate">{value.brandName}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange({ productId: '', productName: '', brandName: null, imageUrl: null })}
          className="text-xs text-red-500 hover:underline"
        >
          {t('routines_pick_change')}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={boxRef}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t('routines_search_placeholder')}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
      />
      {open && (query.trim() || loading) && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading && <p className="p-3 text-sm text-gray-500">{t('routines_loading')}</p>}
          {!loading && results.length === 0 && (
            <p className="p-3 text-sm text-gray-500">{t('routines_no_results')}</p>
          )}
          {results.map((p) => (
            <button
              key={p.productId}
              type="button"
              onClick={() => {
                onChange(p);
                setOpen(false);
                setQuery('');
                setResults([]);
              }}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
            >
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
              ) : null}
              <span className="text-sm text-gray-900 dark:text-white truncate">{p.productName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Global Constraints:**
- Dùng `useLocale` từ `@/components/I18nProvider` (đã tồn tại). Các key i18n (`routines_search_placeholder`, `routines_loading`, `routines_no_results`, `routines_pick_change`) sẽ được thêm ở Task 8 — component chỉ gọi `t()`, không cần tự thêm dict.
- Gọi `/api/products/search?q=` (Task 1 đã tạo).
- Verify: `npx tsc --noEmit` (0 errors) + `npm run build` (pass).

**Commit:** `git add components/ProductPicker.tsx && git commit -m "feat: ProductPicker component cho routine"`

**Report:** `.superpowers/sdd/task-3-report.md`. Trả status + commits + 1 dòng summary.
