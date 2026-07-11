# Task 6: Trang chi tiết routine `[id]`

**Files:**
- Create: `lib/routine-utils.ts`
- Create: `app/customer/routines/[id]/page.tsx`
- Modify: `components/RoutineList.tsx` (bọc tiêu đề bằng link đến detail)

## 6.1 `lib/routine-utils.ts` (tạo mới)

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

## 6.2 `app/customer/routines/[id]/page.tsx` (tạo mới)

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

## 6.3 Sửa `components/RoutineList.tsx`

Tìm block tiêu đề (khoảng dòng 42-44):
```tsx
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{r.title}</h3>
                {r.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.description}</p>}
```
thay thành:
```tsx
              <div>
                <a href={`/customer/routines/${r.id}`} className="hover:underline">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{r.title}</h3>
                </a>
                {r.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.description}</p>}
```

## Global Constraints
- Trang detail bảo vệ auth: chưa login → redirect `/customer/login`.
- Dùng `GET /api/customer/routines/[id]` (Task 2). API trả `routine.items` có productName/brandName/imageUrl.
- `groupItemsByTimeOfDay` + `TIME_ORDER` từ `lib/routine-utils`.
- Verify: `npx tsc --noEmit` + `npm run build` pass.

## Commit
`git add lib/routine-utils.ts app/customer/routines/[id]/page.tsx components/RoutineList.tsx && git commit -m "feat: trang chi tiết routine + link từ list"`

## Report: `.superpowers/sdd/task-6-report.md`. Trả status + commits + 1 dòng summary.
