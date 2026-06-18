# API Documentation - UrCheck

## Overview

UrCheck API là REST API cho ứng dụng xác minh mã QR sản phẩm mỹ phẩm.

**Base URL:** `http://localhost:3000/api`
**Content-Type:** `application/json`

---

## Endpoints

### 1. Health Check

Kiểm tra trạng thái service.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-14T10:30:00.000Z",
  "service": "urcheck API",
  "version": "1.0.0"
}
```

**Example:**
```bash
curl http://localhost:3000/api/health
```

---

### 2. Verify QR Code

Xác minh mã QR và trả về thông tin sản phẩm.

**Endpoint:** `POST /verify`

**Request Body:**
```json
{
  "qrCode": "string (required, max 500 chars)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "valid": true,
  "product": {
    "id": "string",
    "name": "string",
    "description": "string | null",
    "sku": "string",
    "batchNumber": "string",
    "manufactureDate": "ISO string",
    "expiryDate": "ISO string",
    "imageUrl": "string | null",
    "companyName": "string",
    "companyAddress": "string | null",
    "verified": "boolean",
    "createdAt": "ISO string",
    "updatedAt": "ISO string"
  },
  "message": "Sản phẩm hợp lệ"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid input:
```json
{
  "success": false,
  "valid": false,
  "error": "Validation error",
  "message": "Dữ liệu không hợp lệ"
}
```

- **404 Not Found** - QR code not in database:
```json
{
  "success": false,
  "valid": false,
  "message": "Mã QR không tồn tại trong hệ thống"
}
```

- **Expired Product** - Product exists but expired:
```json
{
  "success": true,
  "valid": false,
  "product": { ... },
  "message": "Sản phẩm đã hết hạn sử dụng"
}
```

- **Unverified Product** - Product exists but not verified:
```json
{
  "success": true,
  "valid": false,
  "product": { ... },
  "message": "Sản phẩm chưa được xác minh"
}
```

- **500 Internal Server Error**:
```json
{
  "success": false,
  "valid": false,
  "error": "Internal server error",
  "message": "Đã xảy ra lỗi, vui lòng thử lại sau"
}
```

**Side Effects:**
- Increments `scanCount` on QR code
- Updates `lastScannedAt` timestamp
- Creates a `ScanLog` entry with IP and User-Agent

**Example:**
```bash
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "UR-ORD-VC10-30ML-ABC123"}'
```

---

### 3. Get Product by SKU

Lấy thông tin sản phẩm theo SKU.

**Endpoint:** `GET /api/product/[sku]`

**URL Parameters:**
- `sku` - Product SKU (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "product": {
    "id": "string",
    "name": "string",
    "description": "string | null",
    "sku": "string",
    "batchNumber": "string",
    "manufactureDate": "ISO string",
    "expiryDate": "ISO string",
    "imageUrl": "string | null",
    "companyName": "string",
    "companyAddress": "string | null",
    "verified": "boolean",
    "createdAt": "ISO string",
    "updatedAt": "ISO string"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Sản phẩm không tồn tại"
}
```

**Example:**
```bash
curl http://localhost:3000/api/product/ORD-VC10-30ML
```

---

## Data Models

### Product
```typescript
{
  id: string
  name: string
  description?: string
  sku: string (unique)
  batchNumber: string
  manufactureDate: Date
  expiryDate: Date
  imageUrl?: string
  companyName: string
  companyAddress?: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
}
```

### QRCode
```typescript
{
  id: string
  code: string (unique)
  productId: string
  scanCount: number
  lastScannedAt?: Date
  createdAt: Date
}
```

### ScanLog
```typescript
{
  id: string
  qrCode: string
  ipAddress?: string
  userAgent?: string
  scannedAt: Date
}
```

---

## Error Handling

All endpoints return consistent JSON responses:

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | API call success status |
| `valid` | boolean | (verify only) QR validity status |
| `data` | T | Success data payload (alternative to product) |
| `error` | string | Error code for debugging |
| `message` | string | Human-readable message |

---

## Rate Limiting

⚠️ **NOT IMPLEMENTED YET** - Rate limiting is planned but not active.

Planned limits:
- 100 requests/minute per IP for `/api/verify`
- 1000 requests/minute per IP for `/api/health`
- 60 requests/minute per IP for `/api/product/[sku]`

---

## Testing

Use the seed data to test:

**Valid QR codes:**
1. Serum Vitamin C - SKU: `ORD-VC10-30ML`
2. Sunscreen - SKU: `BOJ-SUN50-50ML`
3. Cleansing Oil - SKU: `HL-OILCL-150ML`

**Expired Product:**
4. Collagen - SKU: `TRD-COL-30ML` (expires 2024-12-01)

QR code format: `UR-{SKU}-{6-CHAR-RANDOM}`

---

## Implementation Notes

- Built with Next.js 16 App Router
- TypeScript with Zod validation
- Prisma ORM with PostgreSQL
- Scan logging for analytics
- Automatic scan count tracking
