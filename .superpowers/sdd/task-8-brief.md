# Task 8: i18n keys + verify build

**File to modify:** `lib/i18n.ts`

Các component Tasks 3-7 dùng các key i18n CHƯA CÓ trong dict: `routines_search_placeholder`, `routines_loading`, `routines_no_results`, `routines_pick_change`, `routines_need_product`, `routines_not_found`, `routines_back`, `routines_clone`, `routines_cloned`.

**Thêm vào dict `vi`**: tìm dòng (gần cuối dict vi) `routines_no_products: 'Chưa có sản phẩm nào trong lịch trình',` và thêm NGAY SAU đó (trước `},` đóng dict vi):

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

**Thêm vào dict `en`**: tìm dòng `routines_no_products: 'No products in this routine',` và thêm NGAY SAU đó (trước `},` đóng dict en):

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

(LƯU Ý: dict `vi` và `en` là 2 object riêng biệt — đọc file để xác định đúng vị trí mỗi dict. Dict `vi` nằm trước, dict `en` sau.)

## Verify
1. `npx tsc --noEmit` → 0 errors.
2. `npm run build` → pass (exit 0).

## Commit
`git add lib/i18n.ts && git commit -m "feat: i18n keys cho routine picker/detail/share"`

## Report: `.superpowers/sdd/task-8-report.md`. Trả status + commits + 1 dòng summary (build result).
