# UrCheck - Quick Start Guide

## Setup in 3 Steps

### Step 1: Start Database
Double-click `setup-db.bat` hoặc chạy manually:
```bash
cd "D:\Docker Compose"
docker-compose up -d
```

### Step 2: Initialize Database
```bash
cd "D:\Thực tập\urcheck\urcheck"
npx prisma migrate deploy
npm run seed
```

### Step 3: Run App
```bash
npm run dev
```

Open http://localhost:3000

---

## Files Created

✅ `TASKS_PLAN.md` - Full 21-task plan with tracking
✅ `DATABASE_SETUP.md` - Detailed setup instructions
✅ `setup-db.bat` - One-click setup script
📋 `.env.example` - Environment template (copy to `.env.local`)
✅ `prisma/seed.ts` - Sample data (4 products)

---

## What Works Now

- ✅ Build successful (`npm run build`)
- ✅ Prisma client generated
- ✅ Docker PostgreSQL ready
- ✅ All API routes implemented:
  - `POST /api/verify` - Verify barcode
  - `GET /api/product/[sku]` - Get product by SKU
  - `GET /api/health` - Health check
  - `GET /api/admin/products` - List products (paginated, searchable)
  - `POST /api/admin/products` - Create product
  - `GET /api/admin/products/[id]` - Get product detail
  - `PUT /api/admin/products/[id]` - Update product
  - `DELETE /api/admin/products/[id]` - Delete product
  - `POST /api/admin/products/[id]/images` - Upload image
  - `DELETE /api/admin/products/[id]/images` - Delete image
  - `PUT /api/admin/products/[id]/images` - Reorder images
  - `GET /api/admin/products/[id]/versions` - Version history
  - `POST /api/admin/products/[id]/rollback` - Rollback version
  - `GET /api/admin/verify` - Check admin session
  - `POST /api/admin/login` / `/api/admin/logout`
- ✅ React components with Framer Motion
- ✅ Barcode scanner (camera + upload)
- ✅ Tailwind CSS styling

---

## After Database Setup

You can test with these seed barcodes (output from `npm run seed`):
- Format: `EAN-13 (13 digits)` or `EAN-8 (8 digits)`
- 3 valid products + 1 expired (Torriden collagen)

---

## Next Tasks (Optional)

See `TASKS_PLAN.md` for:
- Rate limiting
- Security headers
- Error boundary
- API standardization
- Unit/integration tests
- Accessibility improvements
