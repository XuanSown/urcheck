# 🚀 Kế Hoạch Phát Triển Tính Năng - URCheck

> **Mục tiêu:** Nâng cấp trải nghiệm người dùng với hệ thống đăng nhập JWT cho customer + 5 tính năng mới.
> **Ngôn ngữ:** TypeScript, Next.js, Prisma, Tailwind CSS
> **Database:** PostgreSQL (sử dụng Prisma ORM)
> **Auth:**
> - **Admin**: JWT-based (`jose`), cookie `admin_session` — ĐÃ CÓ (lib/auth.ts)
> - **Customer**: `CustomerAccount` với `deviceId` (cookie, fallback anonymous) + **MỚI**: email/password + JWT cookie `customer_session`

---

## 📋 Danh Sách Tính Năng (Priority Order)

| # | Status | Tính năng | Effort | Impact | Dependency |
|---|--------|-----------|--------|--------|------------|
| **0** | ✅ DONE | [Đăng nhập + JWT Customer](#-phase-0--đăng-nhập-jwt-customer) | Trung bình (0.5-1 ngày) | ⭐⭐⭐⭐⭐ | None |
| 1 | ⏳ Pending | [Lịch sử quét cá nhân](#1-lịch-sử-quét-cá-nhân) | Thấp (1-2 ngày) | ⭐⭐⭐⭐⭐ | #0 |
| 2 | ⏳ Pending | [Huy hiệu người dùng](#2-huy-hiệu-người-dùng) | Thấp (1 ngày) | ⭐⭐⭐⭐ | #1 |
| **3** | ✅ DONE | [Wishlist sản phẩm](#3-wishlist-sản-phẩm) | Trung bình (2-3 ngày) | ⭐⭐⭐⭐ | #0 |
| 4 | ⏳ Pending | [Chia sẻ routine](#4-chia-sẻ-routine) | Cao (4-5 ngày) | ⭐⭐⭐ | #3 |
| 5 | ✅ DONE | [Feed khám phá sản phẩm](#5-feed-khám-phá-sản-phẩm) | Cao (~2 ngày) | ⭐⭐⭐⭐ | None |

---

## ✅ Phase 0 — Đăng Nhập + JWT Customer (COMPLETED 2026-07-06)

> **Phase 0 Review (2026-07-06)** — Sau khi hoàn thành, đã review sâu và fix 11 vấn đề: 3 Critical + 8 Important.

### 📊 Tổng kết Phase 0

| Trạng thái | Task | Mô tả |
|-----------|------|-------|
| ✅ Done | P0-T1 | Dependencies — Thêm `jose` |
| ✅ Done | P0-T2 | Prisma Schema — Mở rộng `CustomerAccount` + `CustomerLoginLog` |
| ✅ Done | P0-T3 | Lib — `lib/customer-auth.ts` |
| ✅ Done | P0-T4 | API Routes — Customer Auth (6 endpoints) |
| ✅ Done | P0-T5 | Trang — Login / Register / Forgot Password |
| ✅ Done | P0-T6 | Component — CustomerLoginForm |
| ✅ Done | P0-T7 | Header — Customer User Menu |
| ✅ Done | P0-T8 | i18n — Auth keys |

### 📁 Files đã tạo/sửa

| Action | File | Mô tả |
|--------|------|-------|
| Create | `lib/customer-auth.ts` | JWT: sinh/verify token, bcrypt hash, register/login/logout/verifySession/requireCustomerApi |
| Create | `components/CustomerAuth.ts` | Client-safe hook (`useCustomerAuth`) — gọi `/api/customer/verify` và `/api/customer/logout` |
| Create | `app/api/customer/register/route.ts` | API đăng ký (email unique, bcrypt hash) |
| Create | `app/api/customer/login/route.ts` | API login, set HttpOnly JWT cookie |
| Create | `app/api/customer/logout/route.ts` | API logout, xóa cookie |
| Create | `app/api/customer/verify/route.ts` | API verify session (GET) |
| Create | `app/api/customer/forgot-password/request/route.ts` | API gửi OTP |
| Create | `app/api/customer/forgot-password/reset/route.ts` | API reset password bằng OTP |
| Create | `app/customer/login/page.tsx` | Trang đăng nhập customer |
| Create | `app/customer/register/page.tsx` | Trang đăng ký customer |
| Create | `app/customer/forgot-password/page.tsx` | Trang forgot password (2 steps) |
| Create | `components/CustomerLoginForm.tsx` | Form login/register/reuse UI |
| Modify | `components/Header.tsx` | Thêm customer user menu + logout button |
| Modify | `lib/i18n.ts` | Thêm keys đăng nhập (vi/en) |
| Modify | `prisma/schema.prisma` | Thêm `email`, `password`, `resetToken` vào `CustomerAccount` + model `CustomerLoginLog` |
| Modify | `package.json` | Thêm `jose` dependency |

### 🔌 API Endpoints mới

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/customer/register` | Đăng ký + set JWT cookie |
| POST | `/api/customer/login` | Đăng nhập + set JWT cookie |
| POST | `/api/customer/logout` | Đăng xuất + xóa cookie |
| GET | `/api/customer/verify` | Verify session hiện tại |
| POST | `/api/customer/forgot-password/request` | Gửi OTP về email |
| POST | `/api/customer/forgot-password/reset` | Đổi mật khẩu bằng OTP |

### 🎯 Trang mới

| Route | Mô tả |
|-------|-------|
| `/customer/login` | Trang đăng nhập |
| `/customer/register` | Trang đăng ký |
| `/customer/forgot-password` | Trang quên mật khẩu (OTP flow) |

### 🔧 Phase 0 Review — Fixes Áp Dụng (2026-07-06)

#### 🔴 Critical (3)

| # | File | Vấn đề | Fix |
|---|------|--------|-----|
| 1 | `register/route.ts` | Đăng ký xong không set JWT cookie → user phải login lại | Gọi `setCustomerSessionCookie(result.token)` sau khi register thành công |
| 2 | `forgot-password/request/route.ts` | OTP dùng `Math.random()` (không cryptographically secure) | Đổi sang `crypto.getRandomValues()` |
| 3 | `forgot-password/request/route.ts` | Không có rate limiting → spam OTP emails | Thêm rate limit: max 5 requests / 15 phút, cooldown nếu còn OTP active |

#### 🟠 Important (8)

| # | File | Vấn đề | Fix |
|---|------|--------|-----|
| 4 | `forgot-password/request/route.ts` | OTP response message khác nhau khi email có/không → enumeration leak | Cả 2 path trả về cùng message: "Nếu email tồn tại, mã OTP đã được gửi." |
| 5 | `customer-auth.ts` | Fallback `NEXTAUTH_SECRET` → 2 secrets khác nhau | Bỏ fallback, require `JWT_SECRET` explicit |
| 6 | `customer-auth.ts:80-88` | Account takeover nếu có `CustomerAccount` cũ không có password | Thêm guard: trả error nếu email tồn tại nhưng `password` null, không auto-claim |
| 7 | `customer-auth.ts` | Dùng `findFirst` trên field `@unique` | Đổi sang `findUnique` (register + login) |
| 8 | `prisma/schema.prisma` | `OtpVerification` thiếu composite index | Thêm `@@index([email, isUsed, expiresAt])` |
| 9 | `logout/route.ts` | Log `success: true` ngay cả khi session null | Chỉ log khi có session thực tế |
| 10 | `customer-auth.ts` | Cookie `secure` flag hardcoded theo `NODE_ENV` | Hỗ trợ override qua env `COOKIE_SECURE=true` |
| 11 | `customer-auth.ts` | `logCustomerAction` trong register thiếu `success: true` | Thêm `success: true` vào log |

---

## 🗺️ Quy Trình Triển Khai

- Mỗi Phase chia thành **Tasks** nhỏ (~15-45 phút/task).
- Mỗi Task xong → **verify thủ công** → Task tiếp theo.
- Mỗi Phase xong → **báo cáo toàn bộ** → dừng lại chờ duyệt mới qua Phase sau.

---

## 🎯 1. Lịch Sử Quét Cá Nhân

**Mục tiêu:** Customer xem lại lịch sử các sản phẩm đã quét QR, với thông tin chi tiết và trạng thái hạn sử dụng.

### 📝 Tasks Chi Tiết

#### T1: Backend — API lịch sử quét
- **Effort:** ~60 phút
- **File:** `app/api/customer/history/route.ts` (create)
- **Mô tả:** GET endpoint trả về danh sách QR codes đã quét của customer, kèm thông tin product. Query param `page`/`limit` cho phân trang.
- **Verification:** `curl /api/customer/history` → JSON array với product info.

#### T2: Trang — History page
- **Effort:** ~45 phút
- **File:** `app/customer/history/page.tsx` (create)
- **Mô tả:** List các sản phẩm đã quét, hiển thị tên, ngày quét, trạng thái (hợp lệ/hết hạn/không hợp lệ). Phân trang.
- **Guard:** `requireCustomerApi` — redirect về `/customer/login` nếu chưa login.

#### T3: Component — HistoryList
- **Effort:** ~30 phút
- **File:** `components/CustomerHistoryList.tsx` (create)
- **Mô tả:** Reusable list component, hỗ trợ phân trang client-side.

---

## 🎯 2. Huy Hiệu Người Dùng

**Mục tiêu:** Customer nhận huy hiệu (badge) dựa trên hành vi (lần quét đầu, 10 lần quét, 7 ngày hoạt động...).

### 📝 Tasks Chi Tiết

#### T1: Prisma — Model Badge + CustomerBadge
- **Effort:** ~20 phút
- **File:** `prisma/schema.prisma`
- **Mô tả:** Thêm model `Badge` (id, name, descriptionVi, icon, criteria) và `CustomerBadge` (customerId, badgeId, earnedAt).

#### T2: Backend — Seed badges + API
- **Effort:** ~45 phút
- **File:** `lib/seed-badges.ts`, `app/api/customer/badges/route.ts`
- **Mô tả:** Seed 5-7 badges mặc định. API trả về badges earned + locked.

#### T3: Trang + Component — Badge showcase
- **Effort:** ~30 phút
- **File:** `app/customer/badges/page.tsx`, `components/BadgeGrid.tsx`

---

## 🎯 3. Wishlist Sản Phẩm

**Mục tiêu:** Customer lưu sản phẩm yêu thích, xem danh sách, nhận thông báo hạn sử dụng.

### 📝 Tasks Chi Tiết

| Task | Mô tả | Trạng thái |
|------|-------|-----------|
| T1 | Backend — Wishlist API (`app/api/customer/wishlist/route.ts`) | ✅ Done |
| T2 | Trang — Wishlist page (`app/customer/wishlist/page.tsx`) | ✅ Done |
| T3 | Component — WishlistButton (`components/WishlistButton.tsx`) | ✅ Done |
| T4 | Expiry alerts integration — deferred (không tích hợp trong scope này) | ⏳ Deferred |

---

## 🎯 4. Chia Sẻ Routine

**Mục tiêu:** User tạo skincare routine (sản phẩm + thời gian sử dụng), chia sẻ công khai, người khác có thể import.

### 📝 Tasks Chi Tiết

#### T1: Prisma — Model Routine
- **Effort:** ~20 phút
- **File:** `prisma/schema.prisma`
- **Mô tả:** `Routine` (id, customerId, title, description, isPublic, shareToken) + `RoutineItem` (productId, timeOfDay, order).

#### T2: Backend — Routine CRUD API
- **Effort:** ~90 phút
- **File:** `app/api/customer/routines/route.ts` (GET list, POST create, PUT update, DELETE), `app/api/routines/[shareToken]/route.ts` (public view + import)

#### T3: Trang — Routine builder + share
- **Effort:** ~4 giờ
- **File:** `app/customer/routines/page.tsx`, `app/r/[shareToken]/page.tsx`
- **Mô tả:** Drag-drop builder, chọn sản phẩm từ danh sách đã quét/wishlist, tạo share link.

---

## 🎯 5. Feed Khám Phá Sản Phẩm

**Mục tiêu:** Personalized product discovery feed dựa trên lịch sử quét, wishlist, và trending.

### 📝 Tasks Chi Tiết

#### T1: Backend — Recommendation API
- **Effort:** ~3 giờ
- **File:** `app/api/feed/route.ts`
- **Mô tả:** Query sản phẩm dựa trên: lịch sử quét (skin type), wishlist tags, trending (scan count). Pagination.

#### T2: Trang — Discover feed
- **Effort:** ~3 giờ
- **File:** `app/discover/page.tsx`
- **Mô tả:** Infinite scroll, card sản phẩm với action: quét, wishlist, xem chi tiết. Filter theo loại da, thương hiệu.

#### T3: Component — ProductCard, FilterBar
- **Effort:** ~2 giờ
- **File:** `components/ProductCard.tsx`, `components/FilterBar.tsx`

---

## 🛠️ Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| UI | Framer Motion, custom glass-morphism components |
| Backend | Next.js API Routes (Route Handlers) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (`jose`), HttpOnly cookies, bcrypt |
| i18n | Custom lightweight i18n (`lib/i18n.ts`) — vi/en |
| Validation | Zod |

---

## 📌 Ghi Chú

- Build hiện tại đang dùng Next.js 16.2.9 (Turbopack).
- Admin auth đã có sẵn (`lib/auth.ts`) — customer auth tái 100% pattern từ admin.
- `CustomerAccount` model được thiết kế để hỗ trợ cả anonymous (deviceId) và authenticated (email+password).
