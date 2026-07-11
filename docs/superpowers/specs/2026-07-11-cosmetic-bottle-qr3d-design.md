# Thiết kế: Lọ mỹ phẩm 3D + QR cube 3D (Trang chủ)

**Ngày:** 2026-07-11
**Tác giả:** opencode (brainstorming)
**Trạng thái:** Đã duyệt thiết kế

## Mục tiêu

Trên trang chủ (`app/page.tsx` → `Hero`), giữ khối **QR code 3D** hiện tại nhưng đổi sang
màu đen-trắng truyền thống của QR, đồng thời **thêm một lọ mỹ phẩm 3D** xoay cùng trong
một scene. Lọ 3D có thể bấm để mở link sản phẩm (placeholder).

## Bối cảnh (đã khảo sát)

- Trang chủ: `app/page.tsx` (Next.js 16 App Router, React 19, Tailwind v4, framer-motion,
  three `^0.185`, @react-three/fiber `^9.6`, @react-three/drei `^10.7`).
- QR 3D nằm trong `components/home/HeroScene3D.tsx`: `QrCube` tự vẽ texture QR bằng
  `THREE.CanvasTexture` (hàm `buildQrTexture`), màu `PRIMARY = '#ea580c'`, auto-rotate +
  parallax chuột, bọc `Float`, có `Particles`. Mount chỉ khi `!reducedMotion` & `min-width:640px`.
- Fallback tĩnh: `components/home/HeroScene3DFallback.tsx` (SVG QR, đã đen-trắng).
- Design tokens定义在 `app/globals.css`: primary cam `#ea580c`, dark mode class `.dark`,
  font JetBrains Mono. Có sẵn class `sr-only` (kiểm tra/giữ nguyên).

## Thiết kế chi tiết

### 1. QR cube 3D — recolor (giữ 3D)

File: `components/home/HeroScene3D.tsx`, hàm `buildQrTexture`.

- Nền texture: trắng `#ffffff`.
- Các module (ô đen của QR): đen `#111111` (màu truyền thống QR).
- **Bỏ** sử dụng `PRIMARY = '#ea580c'` trong texture QR.
- Giữ nguyên: auto-rotate (`useFrame`), parallax chuột, wrapper `Float`, hình dáng cube.
- Không đổi kích thước, vị trí cube.

### 2. Lọ mỹ phẩm 3D — component mới `CosmeticBottle`

Cùng file `HeroScene3D.tsx` (hoặc component con cùng thư mục nếu file quá dài — ưu tiên
giữ chung file để tái dùng lights/particles).

- **Dựng bằng primitive thuần three.js** (không tải file GLB, không phụ thuộc ngoài):
  - Thân lọ: `LatheGeometry` (profile lọ mỹ phẩm) hoặc `CylinderGeometry` bo tròn.
  - Nắp / vòi: `CylinderGeometry` nhỏ phía trên.
- **Chất liệu:** `MeshPhysicalMaterial` — thủy tinh mờ (`transmission`, `roughness` thấp,
  `thickness`), dịch lỏng bên trong pha màu primary cam `#ea580c` để giữ brand.
- **Chuyển động:** auto-rotate (`useFrame`, cùng tốc độ/kiểu với QR), parallax chuột,
  bọc `Float` (dùng preset giống QR để đồng bộ).
- **Vị trí:** đặt cạnh QR cube (offset trục x, ví dụ `position={[1.2, 0, 0]}`), cùng nằm
  trong 1 `<Canvas>`.
- **Tương tác:**
  - `onClick` → `router.push(PRODUCT_URL)` (Next `useRouter` từ `next/navigation`),
    `e.stopPropagation()`.
  - `onPointerOver`/`onPointerOut` → đổi `document.body.style.cursor = 'pointer'`.
  - `PRODUCT_URL = '/products/sample'` (hằng số dễ đổi ở đầu file).

### 3. Scene chung

- Cả QR cube và `CosmeticBottle` nằm trong cùng `<Canvas>` hiện tại.
- Giữ nguyên: `Particles`, setup ánh sáng (`ambientLight` + `directionalLight` + `pointLight`),
  camera `[0,0,4] fov:45`, `dpr={[1,2]}`, `gl alpha:true`.
- Giữ nguyên điều kiện mount: chỉ khi `!reducedMotion` & `min-width: 640px`
  (Hero import dynamic `ssr:false` đã có).

### 4. Accessibility

- Thêm liên kết ẩn cạnh canvas (bên ngoài `<Canvas>`, trong `Hero` hoặc `page`):
  `<a href="/products/sample" className="sr-only">Xem sản phẩm</a>`
  để bàn phím / screen reader vẫn truy cập được chức năng mở sản phẩm
  (vì click trên canvas không accessible).
- `Canvas` mang `aria-hidden="true"` (trang trí), focus chuyển vào link trên.

### 5. Fallback

- `HeroScene3DFallback.tsx` giữ nguyên (SVG QR đen-trắng tĩnh) — đã đúng màu,
  không đổi. Dùng khi reduced-motion hoặc mobile `<640px`.

## Những gì KHÔNG làm (YAGNI)

- Không tải/tìm file GLB bên ngoài (theo Hướng A đã duyệt).
- Không đổi layout trang chủ, không đổi Hero text/CTA khác.
- Không thêm tính năng quét/xác minh mới (đã có `QrScanner.tsx`).
- Không đổi dark mode hay design tokens khác.

## Rủi ro / lưu ý

- `MeshPhysicalMaterial` với `transmission` có thể nặng trên thiết bị yếu → giữ
  `dpr` giới hạn và chỉ mount desktop. Nếu hiệu năng kém, hạ `transmission` hoặc
  đổi sang `MeshStandardMaterial` (nâng cấp sau nếu cần).
- Vị trí/layout giữa QR và lọ cần chỉnh `position` để cân đối trên desktop; mobile
  dùng fallback nên không ảnh hưởng.

## Tiêu chí hoàn thành

- [ ] QR 3D hiển thị đen-trắng (không còn cam).
- [ ] Lọ 3D xuất hiện cạnh QR, xoay mượt, cùng scene.
- [ ] Bấm lọ → mở `/products/sample`.
- [ ] Link `sr-only` "Xem sản phẩm" tồn tại và truy cập được.
- [ ] Fallback mobile/reduced-motion vẫn hoạt động.
- [ ] `next build` / lint / typecheck qua.
