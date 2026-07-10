# Thiết kế — Đợt 2: Nâng cấp trang Discover (UI + tính năng)

**Ngày:** 2026-07-10
**Tác giả:** opencode (superpowers + brainstorming)
**Phạm vi:** Trang `/discover` khách hàng. Gồm: (1) backend API feed cursor pagination + API wishlist GET; (2) nâng cấp UI (ProductCard, FilterBar, Header, Empty/Error states) + tab "Đã lưu"; (3) infinite scroll thay nút Load more. Đợt mở rộng của redesign home, cùng chuẩn $10k SaaS.

## Mục tiêu
Biến `/discover` từ feed basic thành trang khám phá sản phẩm chuyên nghiệp: giao diện đẹp (editorial trust, palette brand), có danh sách yêu thích (tab "Đã lưu"), cuộn vô hạn mượt, trạng thái rỗng/lỗi chỉn chu. Giữ nguyên luồng verify và ranking feed.

## Hướng đã chọn (từ brainstorming)
- Làm cả UI + tính năng.
- Tính năng mới: (3) Danh sách yêu thích + (4) Infinite scroll. KHÔNG thêm tìm kiếm/sort, KHÔNG bộ lọc nâng cao.
- UI nâng cấp: ProductCard, FilterBar, Empty/Error states, Header trang.
- Wishlist: tab "Đã lưu" ngay trong `/discover` (không trang riêng).
- Infinite scroll: nâng cấp API feed sang cursor pagination.
- Cursor: theo `(score, id)` (giữ ranking feed), stable.

## Phần 1 — Data & API

### 1.1 API feed → cursor pagination `(score, id)`
- `GET /api/feed` (file `app/api/feed/route.ts`): thêm query param `cursor?` (chuỗi base64 JSON `{ s: number, i: string }` = score + id của item cuối trang trước). Giữ `limit` (default 12, max 50). Bỏ依赖 param `page` (vẫn chấp nhận nếu có để tương thích ngược, nhưng client mới chỉ dùng `cursor`).
- Logic ranking giữ nguyên (`scoreProduct`): tính `scored`, sort `(score desc, id asc)`.
- Tìm vị trí bắt đầu: nếu có `cursor` → bỏ qua các item có `(score < cursor.s)` HOẶC `(score == cursor.s && id <= cursor.i)`. Lấy `limit + 1` items.
- `nextCursor`: nếu số item trả về > `limit` → mã hoá item thứ `limit` thành cursor; ngược lại `nextCursor = null`, `hasMore = false`.
- Response: `{ success, products, nextCursor, hasMore, profile }` (bỏ `pagination.page`).
- Public feed (`feedPublic`): cursor theo `(createdAt, id)` tương tự (sort `createdAt desc, id asc`); response cùng shape.

### 1.2 API wishlist GET
- Thêm handler `GET` trong `app/api/customer/wishlist/route.ts` (hiện chỉ có POST).
- Auth: `requireCustomerApi`. Nếu chưa login (không có session customer) → `{ success: false, auth: true }`.
- Nếu login: trả `{ success: true, products: [...] }` — danh sách Product đã lưu, **cùng shape** với feed (`id, name, brandName, skinType, imageUrl, images, suitableFor, tags`) để reuse `ProductCard`. Join qua `userFavorite` → `product`.

### 1.3 Model
- Không đổi schema Prisma. Đã có `userFavorite` (customerId, productId). Bảng `product` có đủ trường.

## Phần 2 — Components & UI

### 2.1 `DiscoverPage`
- File `app/discover/page.tsx`. Thêm state `tab: 'discover' | 'saved'` (default `'discover'`).
- Tab bar: 2 nút "Khám phá" / "Đã lưu", animated underline (framer-motion `layoutId`). `role="tablist"` / `role="tab"` / `aria-selected`.
- Render `DiscoverFeed` (khi tab=discover) hoặc `WishlistGrid` (khi tab=saved).
- Giữ container `max-w-6xl`.

### 2.2 `DiscoverFeed` (mới, thay logic feed cũ trong page)
- Nhận props `skinType`, `brand` từ `FilterBar` (giữ nguyên interface).
- Hook `useInfiniteFeed(skinType, brand)`: gọi `/api/feed?cursor=&limit=12`; gộp `products`; IntersectionObserver ở cuối list trigger load tiếp khi `hasMore` & !loading; reset khi filter đổi.
- Giữ `FilterBar` (không đổi data flow, chỉ trigger reset feed).
- `aria-busy` khi loading; `<div aria-live="polite">` thông báo "Đang tải thêm".

### 2.3 `WishlistGrid` (mới)
- Gọi `GET /api/customer/wishlist` 1 lần khi mount (không infinite).
- Nếu `auth: true` → empty state "Đăng nhập để xem" + nút login (link `/login` hoặc trigger auth).
- Nếu rỗng → empty state "Chưa lưu sản phẩm nào".
- Nếu có → grid `ProductCard` (reuse).

### 2.4 `ProductCard` (làm đẹp, `components/ProductCard.tsx`)
- Giữ layout + nút Quét/Lưu.
- Thêm: hover lift (`hover:-translate-y-1 hover:shadow-lg`, transition), badge "Đã xác minh" (dựa `verifications` count hoặc `scanCount` > 0 — truyền thêm prop `verified?` từ feed), rating sao nếu có `rating` (prop `rating?`).
- Respect `prefers-reduced-motion`: tắt transform (dùng `useReducedMotion`).
- Giữ a11y focus ring.

### 2.5 `FilterBar` (làm đẹp, `components/FilterBar.tsx`)
- Sticky top: `sticky top-0 z-10 backdrop-blur bg-white/80 dark:bg-gray-950/80`.
- Chip lọc dạng pill có nút xoá (nếu đang chọn). Animation xuất hiện (framer-motion).
- Giữ prop interface `skinType, brand, onSkinTypeChange, onBrandChange, onReset`.

### 2.6 States (Empty / Error / Loading)
- Empty: illustration SVG inline + copy (i18n). Error: alert box + nút "Thử lại". Loading: skeleton grid (giữ `animate-pulse`, tinh chỉnh đẹp hơn, aspect-square).
- Áp dụng chung cho cả `DiscoverFeed` và `WishlistGrid`.

## Phần 3 — Header, i18n, a11y, testing

### 3.1 Header trang
- Tiêu đề animated (fade/slide, duration ≤ 300ms, tuân home redesign). Subtitle.
- Tab "Đã lưu" → tiêu đề đổi "Sản phẩm đã lưu" (`discover_saved_title`).
- Respect reduced-motion.

### 3.2 i18n (vi + en, `lib/i18n.ts`)
Thêm keys:
- `discover_tab_discover`, `discover_tab_saved`
- `discover_saved_title`, `discover_saved_empty`, `discover_login_to_view`
- `discover_verified` (badge)
- `feed_load_error_retry` (nút thử lại)
- `filter_clear` (xoá filter)
Giữ keys cũ (`feed_title`, `feed_subtitle`, `feed_empty`, `feed_error`). Key `feed_load_more` có thể bỏ (thay bằng auto-load).

### 3.3 Accessibility
- Tab bar: `role="tablist"` / `role="tab"` / `aria-selected`; grid `aria-busy`.
- Badge "Đã xác minh": `aria-hidden` (trang trí).
- Infinite scroll: `aria-live="polite"` "Đang tải thêm".
- Nút Quét/Lưu giữ focus ring.

### 3.4 Testing
- Không thêm framework test mới (dự án chưa có). Ưu tiên: `tsc --noEmit` 0 lỗi, `npm run lint` 0 error, `npm run build` thành công (như đợt home).
- Manual checklist: feed cursor (page1 → nextCursor → page2 không trùng item); wishlist GET auth/empty/has-data; filter reset reload; reduced-motion (tắt transform/animation); infinite scroll dừng ở `hasMore=false`.

### 3.5 Ngoài phạm vi
- Không đổi schema Prisma.
- Không thêm tìm kiếm/sort, không bộ lọc nâng cao (giữ FilterBar hiện tại: skinType/brand).
- Không trang `/wishlist` riêng (tab trong discover).
- Không so sánh sản phẩm, không giỏ hàng.

## Tiêu chí hoàn thành
- `tsc --noEmit` 0 lỗi, `npm run lint` 0 error file mới/sửa, `npm run build` thành công.
- `/api/feed` trả `nextCursor` + `hasMore`; infinite scroll hoạt động, không trùng item.
- Tab "Đã lưu" hiện wishlist (đã login) / prompt login (chưa login) / empty state.
- ProductCard/FilterBar/Header/Empty+Error được nâng cấp, respect reduced-motion.
- i18n vi+en đủ keys.

(End of file)
