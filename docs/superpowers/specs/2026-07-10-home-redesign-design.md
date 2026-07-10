# Thiết kế — Cải thiện giao diện Home (urcheck)

**Ngày:** 2026-07-10
**Tác giả:** opencode (theo quy trình superpowers + ui-ux-pro-max)
**Phạm vi:** Trang chủ khách hàng (`app/page.tsx`) — đợt 1 của 3 trang (home → discover → customer/routines).

## Mục tiêu
Nâng cấp home từ cấu trúc "Hero + Verify form + Footer" (trống, thiếu trust signals) lên chuẩn "$10k SaaS": vừa tin cậy (A) vừa sang đẹp (B), giữ nguyên palette brand đang có (D). Kết hợp cải thiện visual, cấu trúc nội dung, UX cuối, accessibility/performance.

## Phong cách (từ ui-ux-pro-max)
- Style: Data-Dense / Editorial Trust, light + dark mode đầy đủ, WCAG AA.
- Motion: 150–300ms, spring nhẹ, tôn trọng `prefers-reduced-motion`.
- Icons: SVG (Heroicons/Lucide-style inline), không emoji.
- Ảnh: Unsplash có chủ đích (beauty/skincare/cosmetics), dùng `next/image` + `sizes` để tránh CLS.
- Responsive: 375 / 768 / 1024 / 1440.
- Focus rings visible, contrast 4.5:1, semantic tokens (dùng `primary` đã có).

## Cấu trúc trang (từ trên xuống)
1. **Header** — giữ nguyên (`components/Header`).
2. **Hero** — 2 cột trên lg, xếp chồng trên mobile.
   - Trái: badge "✓ Sản phẩm chính hãng được xác thực" · Headline · Subhead · 2 CTA: `Quét mã QR` (primary → mở `QrScanner`) + `Khám phá sản phẩm` (outline → `/discover`).
   - Phải: ảnh Unsplash mỹ phẩm, bo góc lớn, overlay gradient, badge "Đã xác minh" góc ảnh.
3. **Verify strip** — giữ nguyên chức năng quét mã, nâng visual. Tiêu đề "Xác thực ngay". Input + nút camera + loading/error states GIỮ NGUYÊN logic (`handleVerify`, `?q=` auto-fill, result modal `ProductInfo`).
4. **Cách hoạt động** — 3 bước (01 Quét mã QR · 02 Hệ thống xác thực nguồn gốc · 03 An tâm sử dụng). Icon SVG, số 01/02/03 lớn, hover nhẹ.
5. **Thống kê** — band tương phản: 3–4 chỉ số placeholder (sản phẩm xác thực, độ chính xác, giám sát 24/7). Số lớn, label nhỏ.
6. **Tại sao tin tưởng** — 3 card (Bảo mật mã QR duy nhất · Minh bạch nguồn gốc · Cộng đồng kiểm chứng). Icon + tiêu đề + mô tả.
7. **CTA cuối** — band kêu gọi quét/trải nghiệm + nút.
8. **Footer** — giữ nguyên (`components/Footer`).

## Component mới (trong `components/home/`)
- `Hero.tsx` (chỉnh sửa từ `components/Hero` hiện tại hoặc mới) — nhận props `onScan`, `onExplore`.
- `HowItWorks.tsx` — 3 bước.
- `Stats.tsx` — band thống kê.
- `TrustReasons.tsx` — 3 card.
- `FinalCta.tsx` — CTA cuối.
- `Section.tsx` (nhỏ) — wrapper tiêu đề section + motion reveal tái dùng.

## Luồng dữ liệu / State
- Không đổi API, không đổi logic verify. `app/page.tsx` (`HomeInner`) vẫn giữ state `codeInput/isLoading/error/verifyResult/showScanner` và các hàm `handleVerify/handleReset`. Chỉ tái cấu trúc JSX thành các section component, truyền callback `onScan={() => setShowScanner(true)}`.
- `QrScanner`, `ProductInfo`, `LoadingSpinner`, `Button`, `Card` tái dùng nguyên trạng.

## Accessibility / Performance
- `next/image` cho ảnh Unsplash với `width/height` hoặc `aspect-ratio` + `sizes` → không CLS.
- Mọi button/input có label/aria. Focus ring `focus-visible`.
- `motion` dùng `whileInView` với `once: true`; wrap trong `prefers-reduced-motion` (framer-motion `useReducedMotion`).
- Tương phản 4.5:1 light & dark.

## Nội dung (tự biên tiếng Việt, placeholder)
- Headline: "Xác thực mỹ phẩm thật — an tâm làm đẹp" (dự kiến).
- Subhead, 3 bước, stats, trust cards: viết placeholder rõ nghĩa, dễ sửa sau.
- Ảnh Unsplash: chọn query beauty/skincare; link trực tiếp `images.unsplash.com/photo-...?w=...&q=80&auto=format`.

## Ngoài phạm vi (không làm đợt này)
- Discover, customer/routines (đợt sau).
- Thay đổi backend / schema / auth.
- Đa ngôn ngữ mới (giữ i18n hiện tại).

## Tiêu chí hoàn thành
- `tsc --noEmit` 0 lỗi, `npm run build` thành công.
- Home hiển thị 8 block trên, responsive 375/768/1024/1440, dark mode ok.
- Verify flow vẫn hoạt động (quét / nhập code / ?q= / modal kết quả).
- Ảnh Unsplash load, không broken, không CLS.
- Lint 0 error trong file thay đổi.
