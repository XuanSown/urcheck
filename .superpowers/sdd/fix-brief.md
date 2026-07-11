# Fix wave: final review Important findings

Sửa 2 Important findings từ final review (branch `feature/customer-routines-crud`):

## Fix A: Nút Edit từ trang chi tiết không mở form
`app/customer/routines/[id]/page.tsx` nút Edit gọi `router.push('/customer/routines?edit=${routine.id}')`, nhưng `app/customer/routines/page.tsx` không đọc query param `edit` nên form không mở.

Sửa `app/customer/routines/page.tsx`:
1. Thêm import `useSearchParams` từ `next/navigation` (file đã import gì từ next? đọc để thêm đúng).
2. Trong component, lấy `const searchParams = useSearchParams();`
3. Thêm một `useEffect` chạy sau khi `fetchRoutines` xong: nếu `searchParams.get('edit')` có giá trị, tìm routine tương ứng trong `routines` state, gọi `setEditing(r); setShowForm(true);`.

LƯU Ý: `useSearchParams` yêu cầu component bọc trong `<Suspense>`. Nếu trang chưa có Suspense, bọc nội dung return chính trong `<Suspense fallback={...}>`. Kiểm tra xem `app/customer/routines/page.tsx` có phải client component (đã có 'use client') — có. Next 16 cần Suspense cho useSearchParams.

Pattern đề xuất:
```tsx
import { useSearchParams } from 'next/navigation';
...
const searchParams = useSearchParams();
...
useEffect(() => {
  const editId = searchParams.get('edit');
  if (editId && routines.length && !showForm) {
    const r = routines.find((x: any) => x.id === editId);
    if (r) { setEditing(r); setShowForm(true); }
  }
}, [searchParams, routines, showForm]);
```

## Fix B: handleClone thất bại silently
`app/routines/[shareToken]/page.tsx` hàm `handleClone` chỉ `alert` khi `data.success`. Nếu POST trả lỗi (vd 500/400), user không biết.

Sửa: thêm branch xử lý lỗi:
```typescript
      const data = await res.json();
      if (data.success) {
        alert(t('routines_cloned'));
        router.push('/customer/routines');
      } else {
        alert(t('routines_clone_failed') || 'Không thể lưu routine. Vui lòng thử lại.');
      }
```
Và thêm key i18n vào `lib/i18n.ts` (cả vi và en) sau dòng `routines_cloned` tương ứng:
- vi: `routines_clone_failed: 'Không thể lưu routine. Vui lòng thử lại.',`
- en: `routines_clone_failed: 'Could not save routine. Please try again.',`

## Verify
- `npx tsc --noEmit` → 0 errors
- `npm run build` → pass

## Commit
`git add app/customer/routines/page.tsx app/routines/[shareToken]/page.tsx lib/i18n.ts && git commit -m "fix: xử lý edit từ detail + báo lỗi clone routine"`

## Report
Append vào `.superpowers/sdd/task-8-report.md` (hoặc tạo `.superpowers/sdd/fix-report.md`): status, commits, test/build result.
