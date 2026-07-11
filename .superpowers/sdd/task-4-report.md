# Task 4 Report: Tích hợp ProductPicker vào RoutineForm + validate productId

**Status:** DONE
**Commits:** `feat: tích hợp ProductPicker vào RoutineForm + validate productId`
**Branch:** feature/customer-routines-crud

## Thay đổi áp dụng (6/6 khớp brief)
1. Thêm import `ProductPicker, type PickedProduct`.
2. `RoutineItemInput` cập nhật `brandName/imageUrl/notes` thành `| null`.
3. State init `items` map đủ trường (productId từ `it.productId`, fallback `''`).
4. `addItem` tạo item kèm `productId: ''` và `notes: null`.
5. `handleSubmit` thêm validate `items.some(it => !it.productId)` → `alert(t('routines_need_product'))`.
6. Block render items thay input tay `productName` bằng `<ProductPicker>` + notes input + nút add dùng `t('routines_add_item')`.

## Verify
- `npx tsc --noEmit`: 0 errors.
- `npm run build`: pass (Turbopack, 72 static pages).

## Lưu ý
- API GET `[id]` (Task 2) trả items có `productId` → edit truyền đủ trường.
- Giữ nguyên `TIME_OPTIONS`, title/description/isPublic UI.
