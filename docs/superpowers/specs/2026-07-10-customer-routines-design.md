# Design: Hoàn thiện Customer Routines (CRUD/UI)

**Date:** 2026-07-10
**Status:** Approved

## Context

Tính năng `customer/routines` đã có API CRUD đầy đủ (`GET/POST /api/customer/routines`,
`PUT/DELETE /api/customer/routines/[id]`) và route share công khai
(`GET /api/routines/[shareToken]`). Tuy nhiên phía UI còn lỗ hổng:

1. **Product không gắn được thật** — `RoutineForm` bắt người dùng nhập tay `productName`,
   để `productId` rỗng. API validate `productId` min 1 nên mọi submit đều bị từ chối (400).
2. **Bug Edit** — `app/customer/routines/page.tsx` gọi `<RoutineList>` mà không truyền `onEdit`,
   nên nút Sửa không render và không thể sửa routine.
3. **Chưa có trang chi tiết** routine (xem sản phẩm nhóm theo buổi, ảnh, ghi chú).
4. **Chưa có giao diện xem routine được share** (shareToken) / public, cũng như clone về tài khoản.

Mục tiêu: khép kín vòng đời routine của khách hàng — tạo (chọn sản phẩm thật), sửa, xoá,
xem chi tiết, chia sẻ và clone routine của người khác.

## Schema (không đổi)

`Routine` (id, customerId, title, description?, isPublic, shareToken?, createdAt, updatedAt)
và `RoutineItem` (id, routineId, productId, timeOfDay, order, notes?, createdAt) đã đủ.
Không thay đổi Prisma.

## 1. API mới: tìm kiếm sản phẩm

**File:** `app/api/products/search/route.ts` (Server route, không yêu cầu auth)

- `GET /api/products/search?q=<text>&limit=20`
- Query: `q` (text, optional), `limit` (1–50, default 20)
- Truy vấn `prisma.product.findMany`:
  - `where: { status: 'PUBLISHED', OR: [{ name: { contains: q, mode: 'insensitive' } }, { brandName: { contains: q, mode: 'insensitive' } }] }`
  - `take: limit`
  - `select: { id, name, brandName, images: { where: { isPrimary: true }, take: 1, select: { url: true } } }`
- Map kết quả thành `{ id, name, brandName, imageUrl }` (dùng `primaryImageUrl`).
- Nếu `q` rỗng/undefined → trả rỗng (hoặc limit sản phẩm mới nhất; chọn trả rỗng để tránh noise).
- Response: `{ success: true, products: [...] }`.

## 2. Product Picker trong RoutineForm

Thay input `productName` tay bằng bộ chọn sản phẩm:

- Mỗi item có ô search (debounce ~250ms) gọi `/api/products/search?q=`.
- Dropdown kết quả (tối đa 20): thumbnail + tên + brand. Click chọn → lưu
  `{ productId, productName: name, brandName, imageUrl }` vào item.
- Hiển thị sản phẩm đã chọn (ảnh + tên + brand) với nút "Đổi".
- Validate trước submit: mọi item phải có `productId` không rỗng (khớp schema API).
- Giữ nguyên `timeOfDay`, `order`, `notes`.
- Truyền đúng `{ title, description, isPublic, items }` (items chứa productId thật).

## 3. Sửa bug Edit

- `app/customer/routines/page.tsx`: truyền `onEdit` vào `<RoutineList>`:
  `onEdit={(r) => { setEditing(r); setShowForm(true); }}`.
- `<RoutineList>` đã render nút Sửa khi có `onEdit`; `RoutineForm` đã hỗ trợ `routine` prop
  (dùng PUT khi có `routine.id`).

## 4. Trang chi tiết routine

**File:** `app/customer/routines/[id]/page.tsx` (client component, bảo vệ auth)

- Auth: nếu chưa login → redirect `/customer/login`.
- **Thêm `GET` vào `app/api/customer/routines/[id]/route.ts`** trả về routine + items
  (tái dùng logic map hiện có). Guard quyền sở hữu (`customerId`).
- Hiển thị: tiêu đề, mô tả, badge public/private.
- Nhóm `items` theo `timeOfDay` (morning/afternoon/evening/night) thành 4 section,
  mỗi item: ảnh + tên + brand + ghi chú.
- Hành động: Sửa (mở form modal/redirect), Xoá (confirm → DELETE), Chia sẻ
  (nếu `isPublic`/`shareToken` → copy link `/routines/[shareToken]`).

## 5. Xem shared routine + Clone

**File:** `app/routines/[shareToken]/page.tsx` (client component, công khai)

- Gọi `GET /api/routines/[shareToken]` (đã có) lấy routine + items.
- Hiển thị tương tự trang chi tiết (nhóm theo buổi, ảnh, tên, ghi chú).
- Nút "Lưu vào routine của tôi":
  - Chưa login → redirect `/customer/login?next=/routines/[shareToken]`.
  - Đã login → `POST /api/customer/routines` với `{ title, description, isPublic: false,
    items: [...] }` (clone items, giữ productId/timeOfDay/notes). Thông báo thành công.

## 6. i18n (`lib/i18n.ts`)

Thêm key (vi/en):
- `routines_search_placeholder` — "Tìm sản phẩm..."
- `routines_detail_title` — "Chi tiết lịch trình"
- `routines_share_copy` — "Sao chép link chia sẻ"
- `routines_clone` — "Lưu vào routine của tôi"
- `routines_cloned` — "Đã lưu routine vào tài khoản"
- `routines_group_morning/afternoon/evening/night` — nhãn buổi (nếu chưa có)
- `routines_pick_product` — "Chọn sản phẩm"
- `routines_empty_pick` — "Chưa có sản phẩm nào được chọn"

## 7. Testing & Verification

- `npx tsc --noEmit` → 0 errors.
- `npm run build` → pass.
- Manual:
  1. Tạo routine: search + chọn sản phẩm thật → submit thành công.
  2. Sửa routine: nút Sửa mở form đúng dữ liệu, lưu OK.
  3. Xoá routine: confirm → biến mất khỏi danh sách.
  4. Trang chi tiết: nhóm sản phẩm theo buổi, ảnh/ghi chú hiển thị.
  5. Share: copy link → mở trang public → clone về tài khoản thành công.

## Out of scope (YAGNI)

- Tracking sử dụng / check-in / streak.
- Nhắc nhở (reminder) theo lịch.
- Chỉnh sửa thứ tự kéo-thả (giữ input `order` số).
- Quản lý shareToken nâng cao (đã có từ schema).
