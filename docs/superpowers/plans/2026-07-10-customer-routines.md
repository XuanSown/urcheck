# Customer Routines CRUD/UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khép kín vòng đời routine khách hàng — tạo (chọn sản phẩm thật từ catalog), sửa, xoá, xem chi tiết, chia sẻ và clone routine của người khác.

**Architecture:** API CRUD đã có (`/api/customer/routines`, `/api/customer/routines/[id]`, `/api/routines/[shareToken]`). Plan bổ sung (1) API search sản phẩm công khai, (2) GET trên route `[id]` và enrich share route với product info, (3) Product picker trong `RoutineForm`, (4) sửa bug edit ở `page.tsx`, (5) trang chi tiết `[id]`, (6) trang xem shared + clone. Toàn bộ client components theo pattern `useCustomerAuth` + `useLocale` hiện có.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Prisma 5 + Postgres, zod, `primaryImageUrl` từ `@/lib/product-utils`, `requireCustomerApi` từ `@/lib/customer-auth`.

## Global Constraints

- Không thay đổi Prisma schema (`Routine`/`RoutineItem` đã đủ).
- API routine item yêu cầu `productId` min 1 ký tự → picker PHẢI gửi `productId` thật.
- `routineItemSchema` đã định nghĩa: `productId`, `productName` (min 1), `brandName?`, `imageUrl?` (url), `timeOfDay` enum (`morning|afternoon|evening|night`), `order?`, `notes?` (max 500).
- i18n: `lib/i18n.ts`, dict `vi`/`en`, key dạng `routines_*`. Thêm key mới vào CẢ hai dict.
- Auth khách: `useCustomerAuth()` (client) / `requireCustomerApi()` (server). Chưa login → redirect `/customer/login`.
- Copy chuẩn: dùng `t('routines_*')` cho mọi text UI.
- Build verify: `npx tsc --noEmit` (0 errors) + `npm run build` (pass).

---

## File Structure

- Create: `app/api/products/search/route.ts` — API search sản phẩm PUBLISHED theo tên/brand.
- Modify: `app/api/customer/routines/[id]/route.ts` — thêm `GET` trả routine+items (map product info).
- Modify: `app/api/routines/[shareToken]/route.ts` — include product info trong items (name/brand/image).
- Modify: `components/RoutineForm.tsx` — thay input tay bằng Product Picker.
- Modify: `app/customer/routines/page.tsx` — truyền `onEdit` (sửa bug).
- Create: `app/customer/routines/[id]/page.tsx` — trang chi tiết routine (auth).
- Create: `app/routines/[shareToken]/page.tsx` — trang xem shared + clone (công khai).
- Modify: `lib/i18n.ts` — thêm key mới (vi/en).
- Tạo helpers dùng chung: `components/ProductPicker.tsx` (input search + dropdown chọn), `lib/routine-utils.ts` (groupItemsByTimeOfDay + map share response).

---

### Task 1: API tìm kiếm sản phẩm

**Files:**
- Create: `app/api/products/search/route.ts`

**Interfaces:**
- Consumes: `prisma` (`@/lib/db`), `primaryImageUrl` (`@/lib/product-utils`)
- Produces: `GET /api/products/search?q=&limit=` → `{ success: true, products: [{ id, name, brandName, imageUrl }] }`

- [ ] **Step 1: Tạo route search**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { primaryImageUrl } from '@/lib/product-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));

  if (!q) {
    return NextResponse.json({ success: true, products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { brandName: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: limit,
    select: {
      id: true,
      name: true,
      brandName: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
    },
  });

  const mapped = products.map((p) => ({
    id: p.id,
    name: p.name,
    brandName: p.brandName,
    imageUrl: primaryImageUrl(p.images),
  }));

  return NextResponse.json({ success: true, products: mapped });
}
```

- [ ] **Step 2: Kiểm tra nhanh**

Run: `curl "http://localhost:3000/api/products/search?q=a"`
Expected: JSON `{ "success": true, "products": [...] }` (mảng, có thể rỗng).

- [ ] **Step 3: Commit**

```bash
git add app/api/products/search/route.ts
git commit -m "feat: API search sản phẩm cho routine picker"
```

---

### Task 2: GET trên `[id]` + enrich share route

**Files:**
- Modify: `app/api/customer/routines/[id]/route.ts`
- Modify: `app/api/routines/[shareToken]/route.ts`

**Interfaces:**
- Consumes: `requireCustomerApi` (`@/lib/customer-auth`), `primaryImageUrl`
- Produces: `GET /api/customer/routines/[id]` → `{ success: true, routine: { ...r, items: [...] } }` (items có productName/brandName/imageUrl); share route items cũng có productName/brandName/imageUrl.

- [ ] **Step 1: Thêm GET vào `app/api/customer/routines/[id]/route.ts`**

Ở đầu file (sau import), thêm hàm `mapRoutineItem` (đã có trong route `route.ts` gốc nhưng route `[id]` chưa có). Thêm export GET trước `PUT`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
// ... existing imports ...

function mapRoutineItem(item: any) {
  return {
    ...item,
    productName: item.product?.name ?? (item as any).productName ?? '',
    brandName: item.product?.brandName ?? null,
    imageUrl: primaryImageUrl(item.product?.images) ?? null,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireCustomerApi();
  if ('error' in guard) return guard.error;

  const routine = await prisma.routine.findFirst({
    where: { id, customerId: guard.session.customerId },
    include: {
      items: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true } } },
          },
        },
      },
    },
  });

  if (!routine) {
    return NextResponse.json({ success: false, message: 'Không tìm thấy routine' }, { status: 404 });
  }

  const mapped = { ...routine, items: routine.items.map(mapRoutineItem) };
  return NextResponse.json({ success: true, routine: mapped });
}
```

(Lưu ý: route `[id]` gốc dùng `params: { params: Promise<{ id: string }> }` — giữ nguyên signature.)

- [ ] **Step 2: Enrich share route `app/api/routines/[shareToken]/route.ts`**

Thay `include: { items: { orderBy: { order: 'asc' } } }` bằng include product info, và map items:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { primaryImageUrl } from '@/lib/product-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;
  const routine = await prisma.routine.findFirst({
    where: { shareToken, isPublic: true },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1, select: { url: true } } },
          },
        },
      },
    },
  });

  if (!routine) {
    return NextResponse.json(
      { success: false, message: 'Không tìm thấy lịch trình' },
      { status: 404 }
    );
  }

  const items = routine.items.map((it: any) => ({
    id: it.id,
    productId: it.productId,
    timeOfDay: it.timeOfDay,
    order: it.order,
    notes: it.notes,
    productName: it.product?.name ?? '',
    brandName: it.product?.brandName ?? null,
    imageUrl: primaryImageUrl(it.product?.images),
  }));

  const { customerId, ...rest } = routine as Record<string, unknown>;
  void customerId;
  return NextResponse.json({
    success: true,
    routine: { ...rest, items },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/customer/routines/[id]/route.ts app/api/routines/[shareToken]/route.ts
git commit -m "feat: GET routine by id + enrich share route với product info"
```

---

### Task 3: Product Picker component

**Files:**
- Create: `components/ProductPicker.tsx`

**Interfaces:**
- Consumes: `useLocale` (`@/components/I18nProvider`), `fetch('/api/products/search?q=')`
- Produces: component nhận `value: { productId, productName, brandName, imageUrl } | null` và `onChange(item)`; render ô search + dropdown + thumb đã chọn.

- [ ] **Step 1: Tạo `components/ProductPicker.tsx`**

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

- [ ] **Step 2: Commit**

```bash
git add components/ProductPicker.tsx
git commit -m "feat: ProductPicker component cho routine"
```

---

### Task 4: Tích hợp Picker vào RoutineForm + sửa validate

**Files:**
- Modify: `components/RoutineForm.tsx`

**Interfaces:**
- Consumes: `ProductPicker` (`@/components/ProductPicker`), `PickedProduct`
- Produces: items gửi đi có `productId`/`productName`/`brandName`/`imageUrl` thật; submit bị chặn nếu item thiếu `productId`.

- [ ] **Step 1: Sửa `components/RoutineForm.tsx`**

Thay `TIME_OPTIONS` block và phần render items. Import + state item mới:

```typescript
'use client';

import { useState } from 'react';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { useLocale } from '@/components/I18nProvider';
import { Button } from '@/components/ui/Button';
import { ProductPicker, type PickedProduct } from '@/components/ProductPicker';

const TIME_OPTIONS = [
  { value: 'morning', labelKey: 'routines_morning' },
  { value: 'afternoon', labelKey: 'routines_afternoon' },
  { value: 'evening', labelKey: 'routines_evening' },
  { value: 'night', labelKey: 'routines_night' },
] as const;

type RoutineItemInput = {
  productId: string;
  productName: string;
  brandName?: string | null;
  imageUrl?: string | null;
  timeOfDay: string;
  order: number;
  notes?: string | null;
};
```

State init items (map từ routine nếu có):

```typescript
  const [items, setItems] = useState<RoutineItemInput[]>(
    routine?.items?.length
      ? routine.items.map((it: any) => ({
          productId: it.productId || '',
          productName: it.productName || '',
          brandName: it.brandName ?? null,
          imageUrl: it.imageUrl ?? null,
          timeOfDay: it.timeOfDay || 'night',
          order: it.order ?? 0,
          notes: it.notes ?? null,
        }))
      : [{ productId: '', productName: '', timeOfDay: 'night', order: 0, notes: null }]
  );
```

Hàm add/update/remove (giữ nguyên logic, khởi tạo productId rỗng):

```typescript
  const updateItem = (idx: number, patch: Partial<RoutineItemInput>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addItem = () =>
    setItems((prev) => [...prev, { productId: '', productName: '', timeOfDay: 'night', order: prev.length, notes: null }]);

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
```

Thay block render sản phẩm (phần `items.map`) bằng:

```tsx
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
              <ProductPicker
                value={
                  item.productId
                    ? { productId: item.productId, productName: item.productName, brandName: item.brandName, imageUrl: item.imageUrl }
                    : null
                }
                onChange={(p: PickedProduct) =>
                  updateItem(idx, { productId: p.productId, productName: p.productName, brandName: p.brandName, imageUrl: p.imageUrl })
                }
              />
              <div className="grid grid-cols-12 gap-2 mt-2">
                <select
                  value={item.timeOfDay}
                  onChange={(e) => updateItem(idx, { timeOfDay: e.target.value })}
                  className="col-span-4 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                  ))}
                </select>
                <input
                  value={item.notes ?? ''}
                  onChange={(e) => updateItem(idx, { notes: e.target.value })}
                  placeholder={t('routines_notes_label')}
                  className="col-span-6 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
                />
                <button type="button" onClick={() => removeItem(idx)} className="col-span-2 text-red-500 text-sm">
                  {t('routines_delete')}
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 rounded min-h-[44px]"
          >
            + {t('routines_add_item')}
          </button>
        </div>
```

Sửa `handleSubmit` để validate productId:

```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    const missing = items.some((it) => !it.productId);
    if (missing) {
      alert(t('routines_need_product'));
      return;
    }
    setSaving(true);
    try {
      const url = routine?.id ? `/api/customer/routines/${routine.id}` : '/api/customer/routines';
      const method = routine?.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept-Language': locale },
        body: JSON.stringify({ title, description, isPublic, items }),
      });
      const data = await res.json();
      if (data.success) onSaved();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };
```

- [ ] **Step 2: Commit**

```bash
git add components/RoutineForm.tsx
git commit -m "feat: tích hợp ProductPicker vào RoutineForm + validate productId"
```

---

### Task 5: Sửa bug Edit ở page chính

**Files:**
- Modify: `app/customer/routines/page.tsx`

**Interfaces:**
- Consumes: `<RoutineList onEdit>` (đã có prop), `RoutineForm` (đã hỗ trợ `routine`)
- Produces: click Sửa mở form với dữ liệu đúng.

- [ ] **Step 1: Sửa `app/customer/routines/page.tsx`**

Tìm block:

```tsx
        {loading && !showForm ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <RoutineList routines={routines} onChanged={fetchRoutines} />
        )}
```

Thay thành:

```tsx
        {loading && !showForm ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <RoutineList
            routines={routines}
            onChanged={fetchRoutines}
            onEdit={(r) => {
              setEditing(r);
              setShowForm(true);
            }}
          />
        )}
```

- [ ] **Step 2: Commit**

```bash
git add app/customer/routines/page.tsx
git commit -m "fix: truyền onEdit vào RoutineList (sửa bug edit routine)"
```

---

### Task 6: Trang chi tiết routine `[id]`

**Files:**
- Create: `app/customer/routines/[id]/page.tsx`
- Create: `lib/routine-utils.ts`

**Interfaces:**
- Consumes: `GET /api/customer/routines/[id]`, `useCustomerAuth`, `useLocale`, `requireCustomerApi` pattern cho client, `primaryImageUrl` (nếu cần)
- Produces: `groupItemsByTimeOfDay(items)` helper; trang hiển thị nhóm theo buổi + nút sửa/xoá/chia sẻ.

- [ ] **Step 1: Tạo `lib/routine-utils.ts`**

```typescript
export const TIME_ORDER = ['morning', 'afternoon', 'evening', 'night'] as const;
export type TimeOfDay = (typeof TIME_ORDER)[number];

export function groupItemsByTimeOfDay(items: any[]): Record<TimeOfDay, any[]> {
  const groups = { morning: [], afternoon: [], evening: [], night: [] } as Record<TimeOfDay, any[]>;
  for (const it of items) {
    const key = (TIME_ORDER as readonly string[]).includes(it.timeOfDay) ? (it.timeOfDay as TimeOfDay) : 'night';
    groups[key].push(it);
  }
  return groups;
}
```

- [ ] **Step 2: Tạo `app/customer/routines/[id]/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { useLocale } from '@/components/I18nProvider';
import { Button } from '@/components/ui/Button';
import { TIME_ORDER, groupItemsByTimeOfDay } from '@/lib/routine-utils';

export default function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { customer, loading: authLoading } = useCustomerAuth();
  const { t, locale } = useLocale();
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (authLoading || !customer || !id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customer/routines/${id}`, { headers: { 'Accept-Language': locale } });
        const data = await res.json();
        if (data.success) setRoutine(data.routine);
        else setNotFound(true);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, customer, id, locale]);

  if (authLoading || (loading && !notFound)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    router.push('/customer/login');
    return null;
  }

  if (notFound || !routine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t('routines_not_found')}</p>
          <a href="/customer/routines" className="text-primary-600 hover:underline">{t('routines_back')}</a>
        </div>
      </div>
    );
  }

  const groups = groupItemsByTimeOfDay(routine.items || []);

  const handleDelete = async () => {
    if (!confirm(`${t('routines_confirm_delete')} "${routine.title}"?`)) return;
    const res = await fetch(`/api/customer/routines/${routine.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/customer/routines');
  };

  const handleShare = () => {
    if (routine.shareToken) {
      const link = `${window.location.origin}/routines/${routine.shareToken}`;
      navigator.clipboard.writeText(link);
      alert(t('routines_copied'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{routine.title}</h1>
            {routine.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{routine.description}</p>}
            <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {routine.isPublic ? t('routines_public_label') : t('routines_private_label')}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/customer/routines?edit=${routine.id}`)}>
              {t('routines_edit_title')}
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>{t('routines_delete')}</Button>
            {routine.isPublic && (
              <Button variant="outline" size="sm" onClick={handleShare}>{t('routines_copy_link')}</Button>
            )}
          </div>
        </div>

        {TIME_ORDER.map((time) => {
          const items = groups[time];
          if (!items.length) return null;
          return (
            <div key={time} className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t(`routines_${time}` as any)}</h2>
              <div className="space-y-2">
                {items.map((it: any) => (
                  <div key={it.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                    {it.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{it.productName}</p>
                      {it.brandName && <p className="text-xs text-gray-500 truncate">{it.brandName}</p>}
                      {it.notes && <p className="text-xs text-gray-500 mt-1">{it.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <a href="/customer/routines" className="text-sm text-primary-600 hover:underline">{t('routines_back')}</a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Link từ list sang detail**

Trong `components/RoutineList.tsx`, bọc tiêu đề routine bằng link đến detail. Sửa block tiêu đề (dòng 42-44) thành:

```tsx
              <div>
                <a href={`/customer/routines/${r.id}`} className="hover:underline">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{r.title}</h3>
                </a>
                {r.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.description}</p>}
```

- [ ] **Step 4: Commit**

```bash
git add lib/routine-utils.ts app/customer/routines/[id]/page.tsx components/RoutineList.tsx
git commit -m "feat: trang chi tiết routine + link từ list"
```

---

### Task 7: Trang shared routine + clone

**Files:**
- Create: `app/routines/[shareToken]/page.tsx`

**Interfaces:**
- Consumes: `GET /api/routines/[shareToken]`, `useCustomerAuth`, `useLocale`, `POST /api/customer/routines`
- Produces: trang công khai hiển thị routine; nút clone → tạo routine mới trong tài khoản.

- [ ] **Step 1: Tạo `app/routines/[shareToken]/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { useLocale } from '@/components/I18nProvider';
import { Button } from '@/components/ui/Button';
import { TIME_ORDER, groupItemsByTimeOfDay } from '@/lib/routine-utils';

export default function SharedRoutinePage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { customer, loading: authLoading } = useCustomerAuth();
  const { t, locale } = useLocale();
  const router = useRouter();
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    params.then((p) => setShareToken(p.shareToken));
  }, [params]);

  useEffect(() => {
    if (!shareToken) return;
    (async () => {
      try {
        const res = await fetch(`/api/routines/${shareToken}`, { headers: { 'Accept-Language': locale } });
        const data = await res.json();
        if (data.success) setRoutine(data.routine);
        else setNotFound(true);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [shareToken, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !routine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <p className="text-gray-700 dark:text-gray-300">{t('routines_not_found')}</p>
      </div>
    );
  }

  const groups = groupItemsByTimeOfDay(routine.items || []);

  const handleClone = async () => {
    if (!customer) {
      router.push(`/customer/login?next=/routines/${shareToken}`);
      return;
    }
    setCloning(true);
    try {
      const res = await fetch('/api/customer/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept-Language': locale },
        body: JSON.stringify({
          title: routine.title,
          description: routine.description,
          isPublic: false,
          items: (routine.items || []).map((it: any) => ({
            productId: it.productId,
            productName: it.productName,
            brandName: it.brandName,
            imageUrl: it.imageUrl,
            timeOfDay: it.timeOfDay,
            order: it.order,
            notes: it.notes,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(t('routines_cloned'));
        router.push('/customer/routines');
      }
    } catch {
      // silent
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{routine.title}</h1>
            {routine.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{routine.description}</p>}
          </div>
          <Button variant="primary" size="sm" onClick={handleClone} loading={cloning}>
            {t('routines_clone')}
          </Button>
        </div>

        {TIME_ORDER.map((time) => {
          const items = groups[time];
          if (!items.length) return null;
          return (
            <div key={time} className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t(`routines_${time}` as any)}</h2>
              <div className="space-y-2">
                {items.map((it: any, idx: number) => (
                  <div key={it.id ?? idx} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                    {it.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{it.productName}</p>
                      {it.brandName && <p className="text-xs text-gray-500 truncate">{it.brandName}</p>}
                      {it.notes && <p className="text-xs text-gray-500 mt-1">{it.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/routines/[shareToken]/page.tsx
git commit -m "feat: trang xem shared routine + clone về tài khoản"
```

---

### Task 8: i18n keys + verify build

**Files:**
- Modify: `lib/i18n.ts`

**Interfaces:**
- Consumes: dict `vi`/`en`
- Produces: thêm các key dùng trong Tasks 3–7.

- [ ] **Step 1: Thêm key vào dict `vi` (trong object `vi: { ... }`, trước dòng cuối `}` của vi)**

```typescript
    routines_search_placeholder: 'Tìm sản phẩm...',
    routines_loading: 'Đang tải...',
    routines_no_results: 'Không tìm thấy sản phẩm',
    routines_pick_change: 'Đổi',
    routines_need_product: 'Vui lòng chọn sản phẩm cho mỗi mục',
    routines_not_found: 'Không tìm thấy lịch trình',
    routines_back: 'Quay lại danh sách',
    routines_clone: 'Lưu vào routine của tôi',
    routines_cloned: 'Đã lưu routine vào tài khoản',
```

- [ ] **Step 2: Thêm key tương ứng vào dict `en`**

```typescript
    routines_search_placeholder: 'Search products...',
    routines_loading: 'Loading...',
    routines_no_results: 'No products found',
    routines_pick_change: 'Change',
    routines_need_product: 'Please pick a product for each item',
    routines_not_found: 'Routine not found',
    routines_back: 'Back to list',
    routines_clone: 'Save to my routines',
    routines_cloned: 'Routine saved to your account',
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: thành công (exit 0), không lỗi type/route.

- [ ] **Step 5: Commit**

```bash
git add lib/i18n.ts
git commit -m "feat: i18n keys cho routine picker/detail/share"
```

---

## Self-Review Notes

- Spec coverage: Task 1 (search API) ✓, Task 2 (GET `[id]` + share enrich) ✓, Task 3 (Picker) ✓, Task 4 (Form tích hợp) ✓, Task 5 (fix edit) ✓, Task 6 (detail) ✓, Task 7 (shared+clone) ✓, Task 8 (i18n+verify) ✓.
- Type consistency: `PickedProduct` defined Task 3, used Task 4. `groupItemsByTimeOfDay` defined Task 6, used Task 6 & 7. `TIME_ORDER` defined Task 6, used 6 & 7. Share route returns `items[]` with productName/brandName/imageUrl (Task 2) — khớp shape clone dùng Task 7.
- Placeholder: không có TBD/TODO; mọi step có code thực.
