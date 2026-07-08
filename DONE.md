
# ✅ Công Việc Đã Hoàn Thành - URCheck

Tài liệu này lưu trữ tất cả feature, phase và task đã hoàn thành. Nội dung được chuyển từ `TODO.md` khi hoàn thành.

---

## 📋 Tổng Quan

| # | Tình trạng | Tính năng | Effort | Impact | Dependency |
|---|-----------|-----------|--------|--------|-----------|
| **0** | ✅ DONE | [Phase 0 — Đăng Nhập + JWT Customer](#-phase-0--đăng-nhập-jwt-customer) | Trung bình (0.5-1 ngày) | ⭐⭐⭐⭐⭐ | None |
| **1** | ✅ DONE | [Lịch Sử Quét Cá Nhân](#1-lịch-sử-quét-cá-nhân) | Thấp (~1 ngày) | ⭐⭐⭐⭐⭐ | #0 |
| **2** | ✅ DONE | [Huy Hiệu Người Dùng](#2-huy-hiệu-người-dùng) | Thấp (~1 ngày) | ⭐⭐⭐⭐ | #0 |
| **3** | ✅ DONE | [Wishlist Sản Phẩm](#3-wishlist-sản-phẩm) | Trung bình (2-3 ngày) | ⭐⭐⭐⭐ | #0 |
| **4** | ✅ DONE | [Chia Sẻ Routine](#4-chia-sẻ-routine) | Cao (~1 ngày) | ⭐⭐⭐ | #3 |
| **5** | ✅ DONE | [Feed Khám Phá Sản Phẩm](#5-feed-khám-phá-sản-phẩm) | Cao (~2 ngày) | ⭐⭐⭐⭐ | None |

---

## ✅ Phase 0 — Đăng Nhập + JWT Customer (COMPLETED 2026-07-06)

> **Mục tiêu:** Triển khai hệ thống đăng nhập/đăng ký cho customer bằng email + password, sử dụng JWT với HttpOnly cookie.

### 🎯 Kết quả

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

### 🔌 API Endpoints

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

### 🔧 Review — Fixes Áp Dụng (2026-07-06)

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

## ✅ 2. Huy Hiệu Người Dùng (COMPLETED 2026-07-07)

> **Mục tiêu:** Customer nhận huy hiệu (badge) dựa trên hành vi (lần quét đầu, 10 lần quét, 7 ngày hoạt động, khám phá thương hiệu...). Hệ thống tự động đánh giá và trao huy hiệu khi customer đạt điều kiện.

### 🎯 Kết quả

| Trạng thái | Task | Mô tả |
|-----------|------|-------|
| ✅ Done | P2-T1 | Prisma — Model Badge + CustomerBadge |
| ✅ Done | P2-T2 | Backend — Seed badges + API |
| ✅ Done | P2-T3 | Trang + Component — Badge showcase |

### 📁 Files đã tạo/sửa

| Action | File | Mô tả |
|--------|------|-------|
| Create | `prisma/migrations/20260707000000_add_badges/migration.sql` | Migration tạo bảng `badges` và `customer_badges` |
| Modify | `prisma/schema.prisma` | Thêm model `Badge` và `CustomerBadge` |
| Create | `lib/badge-service.ts` | Service đánh giá và trao huy hiệu tự động |
| Create | `lib/seed-badges.ts` | Seed 5 badges mặc định |
| Create | `app/api/customer/badges/route.ts` | API trả về badges earned/locked của customer |
| Create | `app/customer/badges/page.tsx` | Trang hiển thị huy hiệu của customer |
| Create | `components/BadgeGrid.tsx` | Component grid hiển thị earned/locked badges |
| Modify | `lib/i18n.ts` | Thêm keys badges (vi/en) |

### 🔌 API Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/customer/badges` | Trả về danh sách badges với trạng thái earned/locked |

### 🎯 Trang mới

| Route | Mô tả |
|-------|-------|
| `/customer/badges` | Trang hiển thị huy hiệu đã mở khóa và chưa mở khóa |

### 🏅 Badges mặc định

| Badge | Tiêu chí | Icon |
|-------|---------|------|
| first_scan | Quét 1 lần | 1️⃣ |
| ten_scans | Quét 10 lần | 🔟 |
| fifty_scans | Quét 50 lần | ⭐ |
| week_active | Hoạt động 7 ngày | 📅 |
| brand_explorer | Khám phá 5 thương hiệu | 🏷️ |

### 🔧 Kiến trúc

- **`evaluateCustomerBadges(customerId)`** — đánh giá tất cả badges, tạo `customerBadge` records mới nếu đạt điều kiện
- **`getBadgesForCustomer(customerId, locale)`** — wrapper có locale support cho API
- Tự động đánh giá mỗi lần fetch badges (real-time, không cần scheduled job)

---

## ✅ 3. Wishlist Sản Phẩm (COMPLETED)

> **Mục tiêu:** Customer lưu sản phẩm yêu thích, xem danh sách wishlist.

### 🎯 Kết quả

| Task | Mô tả | Trạng thái |
|------|-------|-----------|
| T1 | Backend — Wishlist API (`app/api/customer/wishlist/route.ts`) | ✅ Done |
| T2 | Trang — Wishlist page (`app/customer/wishlist/page.tsx`) | ✅ Done |
| T3 | Component — WishlistButton (`components/WishlistButton.tsx`) | ✅ Done |
| T4 | Expiry alerts integration | ⏳ Deferred (không tích hợp trong scope) |

---

## ✅ 1. Lịch Sử Quét Cá Nhân (COMPLETED)

> **Mục tiêu:** Customer xem lại lịch sử các sản phẩm đã quét QR, với thông tin chi tiết và trạng thái hạn sử dụng.

### 🎯 Kết quả

| Trạng thái | Task | Mô tả |
|-----------|------|-------|
| ✅ Done | T1 | Backend — API lịch sử quét (`app/api/customer/history/route.ts`) |
| ✅ Done | T2 | Trang — History page (`app/customer/history/page.tsx`) |
| ✅ Done | T3 | Component — HistoryList (`components/CustomerHistoryList.tsx`) |

### 📁 Files đã tạo

| Action | File | Mô tả |
|--------|------|-------|
| Create | `app/api/customer/history/route.ts` | GET endpoint trả danh sách scanLog của customer, join product info, phân trang |
| Create | `app/customer/history/page.tsx` | Trang lịch sử quét với skeleton loading, phân trang client-side |
| Create | `components/CustomerHistoryList.tsx` | Reusable list component hiển thị product + status badge |
| Modify | `lib/i18n.ts` | Thêm keys history (vi/en) |
| Modify | `components/Header.tsx` | Thêm link "Lịch sử" vào customer menu |

### 🔌 API Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/customer/history?page=1&limit=10` | Trả về lịch sử quét + phân trang |

### 🎯 Trang mới

| Route | Mô tả |
|-------|-------|
| `/customer/history` | Trang lịch sử quét cá nhân |

---

## 📌 Ghi Chú Chung

- Build hiện tại đang dùng Next.js 16.2.9 (Turbopack).
- Admin auth đã có sẵn (`lib/auth.ts`) — customer auth tái 100% pattern từ admin.
- `CustomerAccount` model được thiết kế để hỗ trợ cả anonymous (deviceId) và authenticated (email+password).
- i18n system hỗ trợ vi/en, lưu preference trong localStorage + cookie.
