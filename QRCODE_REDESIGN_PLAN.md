# urcheck — Kế hoạch redesign: từ Barcode sang QR Code

**Ngày tạo:** 2026-06-25
**Trạng thái:** 📝 Chờ duyệt — chưa code
**Mục tiêu:** Thay đổi dự án từ verify bằng **barcode** sang verify bằng **QR code**, đồng thời ẩn tính năng barcode nhưng **không xóa** (giữ lại để sau này bật lại).

---

## 📋 Tóm tắt yêu cầu (đã chốt với anh)

| # | Quyết định | Ghi chú |
|---|---|---|
| 1 | **Ẩn barcode** khỏi UI/API nhưng **không xóa** code | Feature flag `ENABLE_BARCODE=false` |
| 2 | **Thay bằng QR code** cho tính năng verify | Thêm model `QrCode` mới |
| 3 | **Admin workflow**: tạo sản phẩm → lưu → hiện 2 nút (Download QR, Print QR) | In QR để dán lên sản phẩm |
| 4 | **Mã QR** sinh tự động = `hash(tên sản phẩm + timestamp)` | Mã hash ngắn (vd 6-8 ký tự) |
| 5 | **Nội dung QR** = URL trỏ về trang verify | `https://<domain>/v/AB12CD` |
| 6 | **Mỗi sản phẩm 1 mã QR** | Sau này mở rộng nhiều QR/lô nếu cần |
| 7 | **Mã đơn hàng + mã lô**: mặc định tự động, admin có thể nhập tay | Override được |
| 8 | **Database mới**: thêm model `QrCode`, giữ nguyên `Barcode` | Tương thích ngược |
| 9 | **Trang chủ `/` đổi thành trang verify** (Cách 1) | Không tạo `/v/[code]` riêng |
| 10 | **Render QR bằng thư viện JS** frontend | `qrcode.react` (React component) |

---

## 🏗️ Kiến trúc đề xuất

### Database Schema (Prisma)

**Thêm mới model `QrCode`:**
```prisma
model QrCode {
  id           String    @id @default(cuid())
  code         String    @unique              // Hash ngắn, vd "AB12CD"
  productId    String
  product      Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  // Nội dung QR (URL)
  url          String                          // URL đầy đủ, vd "https://urcheck.vn/v/AB12CD"

  // Metadata có thể nhúng
  orderCode    String?                         // Mã đơn hàng (admin nhập/tự sinh)
  batchCode    String?                         // Mã lô (admin nhập/tự sinh)

  // Stats
  scanCount    Int       @default(0)
  lastScannedAt DateTime?

  isActive     Boolean   @default(true)        // Có thể tắt QR cũ khi cần

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([code])
  @@index([productId])
  @@map("qr_codes")
}
```

**Giữ nguyên `Barcode`** (không xóa, không dùng) — vẫn có scanCount, lastScannedAt riêng cho tracking nếu sau này bật lại.

**Thêm quan hệ vào `Product`:**
```prisma
model Product {
  // ... các field hiện tại
  qrCodes  QrCode[]                          // MỚI: 1 product có thể có nhiều QR (sau này mở rộng)
}
```

### Frontend Flow

```
┌─────────────────────────────────────────────────────────────┐
│  /admin/products/new                                         │
│                                                               │
│  [Form nhập thông tin sản phẩm]                              │
│  - Tên, SKU, Mô tả                                           │
│  - Manufacture date, Expiry date                              │
│  - Công ty                                                    │
│  - Mã đơn hàng (mặc định: tự sinh, có thể override)          │
│  - Mã lô    (mặc định: tự sinh, có thể override)             │
│  - Pros/Cons, Tags                                            │
│                                                               │
│  [Nút: Lưu sản phẩm]                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓ (sau khi save thành công)
┌─────────────────────────────────────────────────────────────┐
│  Modal: QR Code đã sẵn sàng                                   │
│                                                               │
│  ┌──────────────┐                                            │
│  │   [QR IMG]   │  ← QR code render từ URL                   │
│  │   AB12CD     │                                            │
│  └──────────────┘                                            │
│                                                               │
│  Mã QR: AB12CD                                               │
│  URL: https://urcheck.vn/v/AB12CD                            │
│                                                               │
│  [📥 Download QR]   [🖨️ In QR]   [Đóng]                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  /  (Trang chủ — verify)                                     │
│                                                               │
│  ┌─────────────────────────────┐                             │
│  │ Nhập mã hoặc URL:          │                             │
│  │ [____________________] [✓] │                             │
│  └─────────────────────────────┘                             │
│                            ↓                                  │
│         ┌──────────────────────────────┐                     │
│         │ Hiển thị ProductInfo cũ     │                     │
│         │ + thông tin QR đã scan       │                     │
│         └──────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Cấu trúc file thay đổi

### Files MỚI
```
prisma/migrations/20260625_add_qr_code_model/migration.sql
components/admin/QrCodeDisplay.tsx              # Component hiển thị QR + 2 nút Download/Print
components/admin/QrCodeDialog.tsx               # Modal sau khi lưu sản phẩm
app/api/qr/[code]/route.ts                      # GET /api/qr/[code] — verify QR code
lib/qr-utils.ts                                 # generateQrCode(), buildQrUrl()
lib/feature-flags.ts                            # isBarcodeEnabled(), isQrEnabled()
```

### Files SỬA
```
prisma/schema.prisma                            # Thêm QrCode model
.env / .env.example                             # Thêm ENABLE_BARCODE=false, BASE_URL
lib/validators.ts                               # Cập nhật schema, bỏ field barcodes optional
app/admin/products/new/ProductForm.tsx          # Đổi UI: barcode input → orderCode/batchCode
app/admin/products/[id]/page.tsx                # Đổi UI tương tự
app/admin/products/new/page.tsx                 # Thêm QR dialog sau khi save
app/api/admin/products/route.ts                 # Tạo QrCode tự động khi tạo Product
app/api/admin/products/[id]/route.ts            # Tạo QrCode khi sửa Product
app/page.tsx                                    # Đổi từ scanner → form nhập mã
components/BarcodeScanner.tsx                   # Ẩn bằng feature flag
components/admin/BarcodeScannerDialog.tsx       # Ẩn bằng feature flag
app/api/verify/route.ts                          # Ẩn bằng feature flag (route vẫn tồn tại, trả 404)
README.md                                       # Cập nhật docs
```

### Files GIỮ NGUYÊN (chỉ ẩn, không xóa)
```
app/api/verify/route.ts                          # API barcode cũ — giữ, flag tắt
components/BarcodeScanner.tsx                   # Component scanner cũ — giữ, flag tắt
components/admin/BarcodeScannerDialog.tsx       # Component dialog cũ — giữ, flag tắt
prisma/schema.prisma (Barcode model)            # Model Barcode — giữ nguyên
```

---

## 🔧 Chi tiết triển khai

### Bước 1: Feature Flag (`lib/feature-flags.ts`)

```typescript
export const isBarcodeEnabled = (): boolean => {
  return process.env.ENABLE_BARCODE === 'true';
};

export const isQrEnabled = (): boolean => {
  return process.env.ENABLE_QR !== 'false';  // Mặc định ON
};
```

**`.env.example` thêm:**
```bash
# Feature flags (default: barcode OFF, qr ON)
ENABLE_BARCODE=false
ENABLE_QR=true

# Base URL cho QR (anh set sau khi deploy)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Bước 2: QR Code Generator (`lib/qr-utils.ts`)

```typescript
import { createHash } from 'crypto';

export function generateQrCode(productName: string, timestamp: number = Date.now()): string {
  // Hash từ tên + timestamp → lấy 6 ký tự alphanumeric uppercase
  const hash = createHash('sha256')
    .update(`${productName}-${timestamp}`)
    .digest('hex')
    .toUpperCase();
  return hash.substring(0, 6);  // vd "A3B7C9"
}

export function buildQrUrl(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/?q=${code}`;
}

export function generateOrderCode(): string {
  // ORD-{timestamp cuối}
  const ts = Date.now().toString().slice(-8);
  return `ORD-${ts}`;
}

export function generateBatchCode(): string {
  // B-{timestamp cuối}
  const ts = Date.now().toString().slice(-8);
  return `B-${ts}`;
}
```

### Bước 3: API Endpoint Mới

**`app/api/qr/[code]/route.ts`** — GET endpoint:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!isQrEnabled()) {
    return NextResponse.json({ success: false, message: 'Tính năng QR đang tắt' }, { status: 503 });
  }

  const { code } = await params;

  const qrCode = await prisma.qrCode.findUnique({
    where: { code },
    include: {
      product: {
        select: {
          id: true, name: true, description: true, sku: true,
          batchNumber: true, manufactureDate: true, expiryDate: true,
          imageUrl: true, companyName: true, companyAddress: true,
          verified: true, createdAt: true, updatedAt: true,
          // Thêm fields mới cho QR
          skinType: true, suitableFor: true,
          pros: true, cons: true, tags: true,
        }
      }
    }
  });

  if (!qrCode || !qrCode.isActive) {
    return NextResponse.json({ success: false, message: 'Mã QR không tồn tại' }, { status: 404 });
  }

  // Update scan count
  await prisma.qrCode.update({
    where: { id: qrCode.id },
    data: {
      scanCount: { increment: 1 },
      lastScannedAt: new Date(),
    },
  });

  // Tính valid
  const isExpired = new Date(qrCode.product.expiryDate) < new Date();
  const isValid = qrCode.product.verified && !isExpired;

  return NextResponse.json({
    success: true,
    valid: isValid,
    qrCode: {
      code: qrCode.code,
      orderCode: qrCode.orderCode,
      batchCode: qrCode.batchCode,
      scanCount: qrCode.scanCount,
    },
    product: { /* ... serialized product ... */ },
    message: isValid ? 'Sản phẩm hợp lệ' : (isExpired ? 'Đã hết hạn' : 'Chưa xác minh'),
  });
}
```

### Bước 4: Component Hiển thị QR (`components/admin/QrCodeDisplay.tsx`)

```tsx
'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';

interface QrCodeDisplayProps {
  code: string;        // "AB12CD"
  url: string;         // URL đầy đủ
  productName: string;
  orderCode?: string;
  batchCode?: string;
  onClose?: () => void;
}

export function QrCodeDisplay({ code, url, productName, orderCode, batchCode, onClose }: QrCodeDisplayProps) {
  const handleDownload = () => {
    // Lấy SVG, convert thành PNG, trigger download
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    // ... convert SVG to PNG và download
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>In QR - ${productName}</title></head>
        <body>
          <h2>${productName}</h2>
          <p>Mã QR: <strong>${code}</strong></p>
          ${orderCode ? `<p>Mã đơn: ${orderCode}</p>` : ''}
          ${batchCode ? `<p>Mã lô: ${batchCode}</p>` : ''}
          ${svg.outerHTML}
          <script>window.print();</script>
        </body>
      </html>
    `);
  };

  return (
    <div>
      <QRCodeSVG
        id="qr-svg"
        value={url}
        size={256}
        level="H"
        includeMargin
      />
      <p>Mã: <strong>{code}</strong></p>
      <p>URL: <a href={url}>{url}</a></p>
      <Button onClick={handleDownload}>📥 Download QR</Button>
      <Button onClick={handlePrint}>🖨️ In QR</Button>
    </div>
  );
}
```

### Bước 5: Cập nhật ProductForm

**Đổi UI barcode input thành orderCode/batchCode:**
```tsx
<div>
  <label>Mã đơn hàng (tùy chọn)</label>
  <input
    type="text"
    name="orderCode"
    value={formData.orderCode || ''}
    onChange={handleChange}
    placeholder="Để trống = tự sinh"
  />
</div>
<div>
  <label>Mã lô (tùy chọn)</label>
  <input
    type="text"
    name="batchCode"
    value={formData.batchCode || ''}
    onChange={handleChange}
    placeholder="Để trống = tự sinh"
  />
</div>
```

**Sau khi save thành công:**
```tsx
if (result.qrCode) {
  setGeneratedQr({
    code: result.qrCode.code,
    url: result.qrCode.url,
    orderCode: result.qrCode.orderCode,
    batchCode: result.qrCode.batchCode,
  });
  setShowQrDialog(true);
}
```

### Bước 6: Trang chủ `/` đổi thành Verify Form

```tsx
'use client';

export default function Home() {
  const [code, setCode] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Parse URL nếu user paste full URL
  const parseInput = (input: string): string => {
    const trimmed = input.trim();
    // Try parse as URL
    try {
      const url = new URL(trimmed);
      const params = url.searchParams.get('q');
      if (params) return params;
      // Try extract from path: /v/AB12CD
      const match = url.pathname.match(/\/v\/([A-Z0-9]+)/i);
      if (match) return match[1];
    } catch {}
    // Plain code
    return trimmed;
  };

  const handleVerify = async () => {
    const cleanedCode = parseInput(code);
    setLoading(true);
    try {
      const res = await fetch(`/api/qr/${cleanedCode}`);
      const data = await res.json();
      if (data.success) setProduct(data.product);
      else setError(data.message);
    } catch (e) {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <main>
        {!product ? (
          <>
            <Hero />
            <section>
              <h2>Xác minh sản phẩm</h2>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã QR hoặc URL..."
              />
              <button onClick={handleVerify}>Xác minh</button>
              {error && <p>{error}</p>}
            </section>
          </>
        ) : (
          <ProductInfo product={product} />
        )}
      </main>
      <Footer />
    </div>
  );
}
```

---

## 🛡️ Ẩn Barcode nhưng KHÔNG xóa

### Áp dụng Feature Flag ở 4 chỗ:

**1. `components/BarcodeScanner.tsx`** — UI scanner trang chủ:
```tsx
import { isBarcodeEnabled } from '@/lib/feature-flags';

export function BarcodeScanner(props) {
  if (!isBarcodeEnabled()) return null;  // ← ẨN hoàn toàn
  // ... code cũ giữ nguyên
}
```

**2. `components/admin/BarcodeScannerDialog.tsx`** — UI admin:
```tsx
import { isBarcodeEnabled } from '@/lib/feature-flags';

export default function BarcodeScannerDialog(props) {
  if (!isBarcodeEnabled()) return null;  // ← ẨN
  // ... code cũ giữ nguyên
}
```

**3. `app/api/verify/route.ts`** — API cũ:
```typescript
import { isBarcodeEnabled } from '@/lib/feature-flags';

export async function POST(request: NextRequest) {
  if (!isBarcodeEnabled()) {
    return NextResponse.json({ success: false, message: 'Tính năng barcode đang tạm tắt' }, { status: 503 });
  }
  // ... code cũ giữ nguyên
}
```

**4. `ProductForm.tsx`** — Input barcode:
```tsx
import { isBarcodeEnabled } from '@/lib/feature-flags';

// Trong form:
// {!isBarcodeEnabled() && <div>QR Code sẽ được tạo tự động</div>}
// {isBarcodeEnabled() && <input barcode ... />}  ← chỉ hiện khi flag ON
```

---

## 📦 Package cần thêm

```bash
npm install qrcode.react
```

`qrcode.react` cung cấp:
- `<QRCodeSVG>` — render SVG (tốt cho in)
- `<QRCodeCanvas>` — render canvas (tốt cho download PNG)
- Tùy chỉnh: size, level (error correction), margin, color

---

## 🔄 Migration thứ tự (để không break DB)

1. Tạo migration mới thêm `QrCode` model → `prisma migrate dev --name add_qr_code`
2. Generate Prisma client → `npx prisma generate`
3. Cập nhật seed.ts để tạo QrCode cho 4 sản phẩm mẫu
4. Code frontend + API
5. Test local
6. Commit + push

---

## 📅 Lộ trình triển khai (ước tính)

| Giai đoạn | Công việc | Thời gian |
|---|---|---|
| 1 | Schema + migration + Prisma generate | 15 phút |
| 2 | Feature flags + QR utils | 20 phút |
| 3 | API mới `/api/qr/[code]` | 20 phút |
| 4 | Component QrCodeDisplay + 2 nút Download/Print | 30 phút |
| 5 | Cập nhật ProductForm (thêm orderCode/batchCode, QR dialog) | 30 phút |
| 6 | Cập nhật trang chủ `/` thành verify form | 25 phút |
| 7 | Áp dụng feature flag cho 4 file barcode | 15 phút |
| 8 | Cập nhật seed.ts | 10 phút |
| 9 | Test local + fix lỗi | 30 phút |
| 10 | Cập nhật docs + commit + push | 15 phút |
| **Tổng** | | **~3.5 tiếng** |

---

## ✅ Tiêu chí hoàn thành

- [ ] Trang chủ `/` có form nhập mã QR hoặc URL
- [ ] Nhập mã → hiển thị thông tin sản phẩm (giống ProductInfo cũ)
- [ ] Admin tạo sản phẩm → modal hiện QR + 2 nút Download/Print
- [ ] Nhấn Download → file PNG được tải về
- [ ] Nhấn Print → mở dialog in với QR
- [ ] Mã đơn hàng, mã lô: auto-fill nếu trống
- [ ] `ENABLE_BARCODE=false` → không có UI scanner nào hiển thị
- [ ] API `/api/verify` cũ trả 503 khi flag off
- [ ] Database vẫn có bảng Barcode, ScanLog, Barcode[] trên Product (không xóa)
- [ ] `npm run build` pass
- [ ] Commit + push lên main

---

## ❓ Câu hỏi cần làm rõ thêm (nếu có)

1. **Domain production**: anh dùng domain gì? `urcheck.vn`? (để build URL QR chính xác)
2. **Logo trong QR**: có muốn nhúng logo urcheck vào giữa QR không? (giúp branding nhưng giảm khả năng scan)
3. **Nhãn QR in ra**: kích thước nhãn mặc định? (vd 4x4cm, 5x5cm?)
4. **Thống kê scan**: trang admin có cần dashboard thống kê "QR nào được scan nhiều nhất" không?
5. **Multi-language**: QR trang `/v/[code]` có cần hỗ trợ tiếng Anh/Việt không?

---

**Trạng thái:** ⏳ Chờ anh review & duyệt
