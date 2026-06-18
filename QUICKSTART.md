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
npx prisma migrate dev --name init
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
✅ `.env.example` - Environment template
✅ `prisma/seed.ts` - Sample data (4 products)

---

## What Works Now

- ✅ Build successful (`npm run build`)
- ✅ Prisma client generated
- ✅ Docker PostgreSQL ready
- ✅ All API routes implemented:
  - `POST /api/verify` - Verify QR code
  - `GET /api/product/[sku]` - Get product by SKU
  - `GET /api/health` - Health check
- ✅ React components with Framer Motion
- ✅ QR scanner (camera + upload)
- ✅ Tailwind CSS styling

---

## After Database Setup

You can test with these seed QR codes (output from `npm run seed`):
- Format: `UR-{SKU}-{RANDOM}`
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
