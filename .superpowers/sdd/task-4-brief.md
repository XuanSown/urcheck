# Task 4: Tích hợp ProductPicker vào RoutineForm + validate productId

**File to modify:** `components/RoutineForm.tsx` (đã tồn tại, đọc trước khi sửa)

Mục tiêu: thay input tay `productName` bằng `<ProductPicker>`; items gửi đi phải có `productId` thật; chặn submit nếu item thiếu `productId`.

**Các thay đổi (áp dụng vào file hiện tại):**

1. Sửa import block đầu file. Thay:
```typescript
import { useState } from 'react';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { useLocale } from '@/components/I18nProvider';
import { Button } from '@/components/ui/Button';
```
thành:
```typescript
import { useState } from 'react';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { useLocale } from '@/components/I18nProvider';
import { Button } from '@/components/ui/Button';
import { ProductPicker, type PickedProduct } from '@/components/ProductPicker';
```

2. Sửa `type RoutineItemInput` (trong file) thành:
```typescript
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

3. Sửa state init `items` (trong component). Thay khối useState items hiện tại bằng:
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

4. Giữ `updateItem`, `addItem`, `removeItem` (nhưng đảm bảo `addItem` tạo item với `productId: ''`):
```typescript
  const updateItem = (idx: number, patch: Partial<RoutineItemInput>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addItem = () =>
    setItems((prev) => [...prev, { productId: '', productName: '', timeOfDay: 'night', order: prev.length, notes: null }]);

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
```

5. Sửa `handleSubmit` — thêm validate productId. Thay khối handleSubmit hiện tại bằng:
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

6. Sửa phần render items (block `items.map(...)`). Thay TOÀN BỘ block map Products hiện tại bằng:
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

**Global Constraints:**
- Giữ nguyên `TIME_OPTIONS`, title/description/isPublic UI.
- `PickedProduct` từ Task 3. items gửi đi giữ productId/thời gian/notes.
- Verify: `npx tsc --noEmit` + `npm run build` pass.

**Commit:** `git add components/RoutineForm.tsx && git commit -m "feat: tích hợp ProductPicker vào RoutineForm + validate productId"`

**Report:** `.superpowers/sdd/task-4-report.md`. Trả status + commits + 1 dòng summary.
