# Database Schema - UrCheck

## Overview

PostgreSQL database với Prisma ORM. 3 tables chính: `Product`, `QrCode`, `ScanLog`.

---

## Schema Diagram

```
┌─────────────────┐       ┌─────────────────┐
│   Product       │       │     QrCode      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄─────►│ id (PK)         │
│ name            │       │ code (unique)   │
│ description     │       │ productId (FK)  │
│ sku (unique)    │       │ scanCount       │
│ batchNumber     │       │ lastScannedAt   │
│ manufactureDate │       │ createdAt       │
│ expiryDate      │       └─────────────────┘
│ imageUrl        │
│ companyName     │       ┌─────────────────┐
│ companyAddress  │       │    ScanLog      │
│ verified        │       ├─────────────────┤
│ createdAt       │       │ id (PK)         │
│ updatedAt       │       │ qrCode          │
└─────────────────┘       │ ipAddress       │
                          │ userAgent       │
                          │ scannedAt       │
                          └─────────────────┘
```

---

## Tables

### Product

Thông tin sản phẩm mỹ phẩm.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, default cuid() | Unique identifier |
| `name` | String | required | Product name |
| `description` | String | nullable | Product description |
| `sku` | String | unique, required | Stock Keeping Unit |
| `batchNumber` | String | required | Manufacturing batch |
| `manufactureDate` | DateTime | required | Date of manufacture |
| `expiryDate` | DateTime | required | Expiration date |
| `imageUrl` | String | nullable | Product image URL |
| `companyName` | String | required | Manufacturer name |
| `companyAddress` | String | nullable | Manufacturer address |
| `verified` | Boolean | default true | Verification status |
| `createdAt` | DateTime | default now() | Creation timestamp |
| `updatedAt` | DateTime | auto update | Last update timestamp |

**Indexes:**
- `sku` (unique)
- `batchNumber`
- `companyName`

**Relations:**
- `qrCodes` (one-to-many → QrCode)

---

### QrCode

Mã QR gán cho sản phẩm.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, default cuid() | Unique identifier |
| `code` | String | unique, required | QR code value |
| `productId` | String | FK → Product.id, onDelete: Cascade | Linked product |
| `scanCount` | Int | default 0 | Number of times scanned |
| `lastScannedAt` | DateTime | nullable | Last scan timestamp |
| `createdAt` | DateTime | default now() | Creation timestamp |

**Indexes:**
- `code` (unique)
- `productId`

**Relations:**
- `product` (many-to-one → Product)

---

### ScanLog

Log các lần scan QR code để analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, default cuid() | Unique identifier |
| `qrCode` | String | required | QR code scanned |
| `ipAddress` | String | nullable | Client IP address |
| `userAgent` | String | nullable | Browser user agent |
| `scannedAt` | DateTime | default now() | Scan timestamp |

**Indexes:**
- `qrCode`
- `scannedAt`

---

## Business Logic

### Product Validity
Một sản phẩm được coi là **hợp lệ** (valid) khi:
1. `verified = true`
2. `expiryDate > current date`

### QR Code Flow
1. User scans QR code
2. System looks up `QrCode.code`
3. If found:
   - Increment `scanCount`
   - Update `lastScannedAt`
   - Create `ScanLog` entry
   - Return linked `Product` data
4. Calculate validity based on product status

---

## Seed Data

`prisma/seed.ts` tạo 4 sản phẩm mẫu:

| Product | SKU | Status | Expires |
|---------|-----|--------|---------|
| Serum Vitamin C | ORD-VC10-30ML | ✅ Valid | 2026-06-15 |
| Sunscreen | BOJ-SUN50-50ML | ✅ Valid | 2026-05-20 |
| Cleansing Oil | HL-OILCL-150ML | ✅ Valid | 2026-07-01 |
| Collagen | TRD-COL-30ML | ❌ Expired | 2024-12-01 |

Mỗi product được tạo với QR code: `UR-{SKU}-{6-random-chars}`

---

## Migrations

- **Initial migration:** `prisma/migrations/20260613170313_init/`
- Schema đã được migrate và production-ready

Để tạo migration mới:
```bash
npx prisma migrate dev --name descriptive_name
```

---

## Queries

### Get product with QR codes
```sql
SELECT p.*, q.code as qr_code, q.scan_count
FROM products p
JOIN qr_codes q ON q.product_id = p.id
WHERE p.sku = 'ORD-VC10-30ML';
```

### Get scan statistics
```sql
SELECT qr_code, COUNT(*) as scan_count
FROM scan_logs
WHERE scanned_at >= NOW() - INTERVAL '7 days'
GROUP BY qr_code
ORDER BY scan_count DESC;
```

### Find expired products
```sql
SELECT name, sku, expiry_date
FROM products
WHERE expiry_date < NOW();
```

---

## Prisma Client Usage

```typescript
import { prisma } from '@/lib/db';

// Find product by QR
const qrRecord = await prisma.qrCode.findUnique({
  where: { code: qrCode },
  include: { product: true }
});

// Increment scan count
await prisma.qrCode.update({
  where: { id: qrRecord.id },
  data: {
    scanCount: { increment: 1 },
    lastScannedAt: new Date()
  }
});

// Log scan
await prisma.scanLog.create({
  data: {
    qrCode,
    ipAddress,
    userAgent
  }
});
```

---

## Environment Variables

```env
DATABASE_URL="postgresql://admin:adminpassword@localhost:5432/prismadb?schema=public"
DIRECT_URL="postgresql://admin:adminpassword@localhost:5432/prismadb?schema=public"
```

---

## Notes

- All foreign keys use `CASCADE` delete - deleting a product removes its QR codes
- `ScanLog` table can grow large - consider partitioning by month in production
- QR code `code` field is unique - no duplicate QR codes allowed
- `verified` flag allows manual override of product authenticity
