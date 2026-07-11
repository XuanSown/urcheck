# Thiết kế — Hiệu ứng 3D Hero (khối QR xoay + parallax chuột)

**Ngày:** 2026-07-10
**Tác giả:** opencode (superpowers + ui-ux-pro-max)
**Phạm vi:** Chỉ Hero của trang chủ khách (`app/page.tsx` → `components/Hero.tsx`). Đợt mở rộng của redesign home.

## Mục tiêu
Thêm hiệu ứng 3D sinh động cho Hero: một khối mã QR 3D xoay (WebGL qua R3F/drei) kết hợp parallax theo chuột trên desktop. Thay thế ảnh Unsplash hiện tại ở cột phải Hero. Giữ nguyên chuẩn hiệu năng $10k SaaS (LCP, mobile, reduced-motion).

## Phong cách
- Vật thể: lập phương (box) cách điệu mã QR — mỗi mặt là lưới ô vuông (grid) gợi ma trận QR; material phát sáng nhẹ (emissive) dùng màu brand `primary` (thay vì cam của `components/about/Scene3D.tsx`).
- Xoay chậm tự động (`useFrame`, ~0.15 rad/s y).
- Dùng `Float` từ drei để có cảm giác nổi nhẹ.

## Tương tác (parallax chuột + auto-rotate)
- Desktop (có `mousemove` + viewport ≥ sm): khối nghiêng theo vị trí chuột — tính góc lệch nhỏ (±0.3 rad) và lerp mượt theo `useFrame`. Auto-rotate vẫn chạy nền.
- Mobile / không chuột: chỉ auto-rotate.
- Dùng `prefers-reduced-motion` để tắt hẳn animation; lúc đó khối đứng yên (vẫn render tĩnh hoặc fallback).

## Hiệu năng & khả năng truy cập (bắt buộc)
- Chỉ mount `<Canvas>` khi: `useReducedMotion() === false` VÀ `window.matchMedia('(min-width: 640px)').matches`.
- Fallback tĩnh (khi reduced-motion / mobile / WebGL lỗi): `<div>` gradient primary + SVG mã QR đơn giản (inline), `aria-hidden`.
- `Canvas`: `dpr={[1,2]}`, `gl={{ antialias:true, alpha:true }}`, `style={{ pointerEvents:'none' }}`, camera `[0,0,4] fov 45`.
- Lazy load: `HeroScene3D` import qua `next/dynamic` với `ssr:false`, `loading` = fallback tĩnh, để không chặn LCP/SSR.
- Không thêm dependency mới (đã có `@react-three/fiber`, `@react-three/drei`, `three`).

## Component
- Tạo: `components/home/HeroScene3D.tsx` — export `HeroScene3D()` (client). Bên trong: `QrCube` (box + grid faces + emissive primary + auto-rotate + parallax mouse), `Particles` tùy chọn (điểm sáng nhẹ, optional, giữ nhẹ), và wrapper điều kiện (reduced-motion/mobile → fallback).
- Sửa: `components/Hero.tsx` — bên phải thay `<Image Unsplash>` bằng `<HeroScene3D />` (bọc `next/dynamic` ssr:false ngay trong Hero hoặc trong HeroScene3D).
- Không đổi logic verify, `onScan`, layout cột.

## Patterns tái dùng
- `components/about/Scene3D.tsx`: cấu trúc Canvas/Float/reduced-motion fallback/dpr. Copy pattern, đổi vật thể + màu.

## Ngoài phạm vi
- Các section home khác (HowItWorks/Stats/Trust/Verify) — không đổi.
- Thêm GLB/model ngoài — không (pure geometry).
- Ảnh Unsplash ở Hero — bỏ (thay bằng 3D).

## Tiêu chí hoàn thành
- `tsc --noEmit` 0 lỗi, `npm run build` thành công.
- Hero hiển thị khối QR 3D xoay trên desktop; parallax chuột mượt; mobile hiển thị fallback tĩnh.
- `prefers-reduced-motion` → không mount Canvas, hiện fallback.
- Viewport < 640px → fallback (không WebGL).
- Lint 0 error trong file mới.
- Không làm tăng đáng kể bundle LCP (lazy, ssr:false).
