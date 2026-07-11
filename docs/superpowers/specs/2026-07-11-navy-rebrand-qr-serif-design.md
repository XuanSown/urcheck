# Thiết kế: Rebrand navy + QR đen-trắng + tiêu đề serif

**Ngày:** 2026-07-11
**Trạng thái:** Đã duyệt, triển khai

## Mục tiêu
1. Bỏ lọ 3D (đã không còn trên code) — chỉ giữ QR cube 3D, đổi sang **đen/trắng truyền thống**.
2. Đổi toàn bộ màu cam `#ea580c` → navy `#2c4c7e` ở **giao diện khách hàng (public + customer)**; admin giữ cam.
3. Kiểm tra lại tương phản màu ở cả sáng và tối.
4. Tiêu đề nổi bật dùng font **serif thanh lịch (Playfair Display)**, viết hoa tinh tế; áp dụng public + customer; body giữ JetBrains Mono.

## Quyết định
- **Phạm vi màu:** Đổi token `--primary` toàn cục sang navy; reset về cam trong `.admin-scope` (bọc `app/admin/layout.tsx`). Public + customer tự động navy, admin giữ cam.
- **Tiêu đề:** Global `h1,h2 { font-family: var(--font-display) }`; admin reset về mono cùng `.admin-scope`.
- **Font:** Playfair Display (có subset vietnamese) qua `next/font/google`, khai báo `--font-display`.

## Chi tiết thay đổi

### A. QR cube đen/trắng — `components/home/HeroScene3D.tsx`
- Thêm `QR_DARK='#111111'`, `QR_LIGHT='#ffffff'`. Tách khỏi `PRIMARY`.
- Texture: nền `#ffffff`, module `#111111`, finder pattern `#111111`.
- Material: `color="#ffffff"`, `emissive` tắt (0), `map={tex}`, giữ `roughness/metalness`.
- `Particles` + `pointLight` dùng `PRIMARY='#2c4c7e'` (navy brand accent).
- Giữ `Float` + auto-rotate + parallax.

### B. Fallback — `components/home/HeroScene3DFallback.tsx`
- `PRIMARY` → `'#2c4c7e'`; QR SVG `fill` → `'#111111'` (đen/trắng).

### C. Token màu — `app/globals.css`
- Rebuild `--primary-50..900` quanh `#2c4c7e` (light).
- `.dark`: variant sáng hơn (`--primary-400 ≈ #93b4e3`, `--primary-600 ≈ #3f5f9f`, `--primary` ≈ `#3f5f9f`) để tương phản trên nền tối.
- Đổi `rgba(234,88,12,…)` / `rgba(249,115,22,…)` cứng trong `pulse-glow`, `glow-border`, `glass-cursor` → navy tương ứng.
- Thêm rule `h1,h2 { font-family: var(--font-display); }`.

### D. Admin reset — `app/admin/layout.tsx`
- Bọc nội dung trong `.admin-scope`.
- CSS: `.admin-scope { --primary: #ea580c; --primary-50..900: <cam scale>; }` và `.admin-scope h1, .admin-scope h2 { font-family: var(--font-mono); }`.

### E. Font display — `app/layout.tsx` + `@theme inline`
- `next/font` Playfair Display → `--font-playfair`; map `--font-display: var(--font-playfair)` trong `@theme inline`.

### F. Hardcode cam → navy (public/customer)
- `components/about/Scene3D.tsx`: `'#ea580c'` → `'#2c4c7e'`.
- `components/QrScanner.tsx`: glow box-shadow cam → navy.
- `components/HowDemo.tsx`: glow cam → navy.
- `components/Preloader.tsx`: `rgba(249,115,22,0.6)` → navy.
- `lib/mailer.ts`: `<h2 color:#f97316>` → navy.

### G. Uppercase tinh tế
- Hero/section title nổi bật (public+customer): thêm `uppercase tracking-[0.02em]` (điều chỉnh theo từng component, không ép toàn bộ heading).

## Kiểm tra sáng/tối
- Light: `text-primary-600 #2c4c7e` trên trắng ≥ 7:1 ✅. Button `bg-primary-600` + chữ trắng ≥ 7:1 ✅.
- Dark: `text-primary-400 #93b4e3` trên nền tối ≥ 9:1 ✅.
- Rà lại success/warning/info/error hai theme, fix nếu < AA.

## Files sửa
`app/globals.css`, `app/layout.tsx`, `app/admin/layout.tsx`, `components/home/HeroScene3D.tsx`, `components/home/HeroScene3DFallback.tsx`, `components/about/Scene3D.tsx`, `components/QrScanner.tsx`, `components/HowDemo.tsx`, `components/Preloader.tsx`, `lib/mailer.ts`.

## Verification
- `npx tsc --noEmit`, `npx eslint`, `npx next build` đều xanh.
