# Database Setup Guide for UrCheck

## Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed

---

## Step 1: Start PostgreSQL Container

From the `D:\Docker Compose` directory:

```bash
cd "D:\Docker Compose"
docker-compose up -d
```

This will start a PostgreSQL container with:
- **Host:** localhost
- **Port:** 5432
- **Database:** prismadb
- **Username:** admin
- **Password:** adminpassword

Verify it's running:
```bash
docker-compose ps
```

You should see `prisma-postgres` with status "Up".

---

## Step 2: Generate Prisma Client (Already Done)

```bash
npx prisma generate
```

✅ Already completed - Prisma client is ready at `node_modules/@prisma/client`

---

## Step 3: Run Database Migrations

From the project root (`D:\Thực tập\urcheck\urcheck`):

```bash
npx prisma migrate dev --name init
```

This will:
- Create the database tables based on `prisma/schema.prisma`
- Apply the migration to your PostgreSQL database

---

## Step 4: Seed the Database

```bash
npm run seed
```

This will create:
- 4 sample products (3 valid, 1 expired)
- Barcodes (EAN-13/EAN-8) for each product
- You'll see console output with the generated barcodes

**Example barcode format:** `8934012345670`

---

## Step 5: Verify Setup

Test the health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "urcheck API",
  "version": "1.0.0"
}
```

---

## Step 6: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Testing the Barcode Scanner

1. Open the app in browser
2. Click "Mở camera" to start camera scanning
3. Or click "Upload ảnh mã vạch" to upload a barcode image

**Test barcodes** (from seed output):
- Use any barcode printed from the seed output
- Format: `EAN-13` or `EAN-8`

**Expected results:**
- ✅ Valid products: Show green "Hợp lệ" badge with full product info
- ❌ Expired product (Torriden collagen): Shows "Hết hạn" in red
- ❌ Invalid barcode: Shows "Mã vạch không tồn tại trong hệ thống"

---

## Database Connection Info

**Connection string** (already in `.env.local`):
```
postgresql://admin:adminpassword@localhost:5432/prismadb?schema=public
```

**Direct URL** (for migrations):
```
postgresql://admin:adminpassword@localhost:5432/prismadb?schema=public
```

---

## Troubleshooting

### "Connection refused" error
- Check if PostgreSQL container is running: `docker-compose ps`
- Start it: `docker-compose up -d`
- Wait a few seconds for PostgreSQL to be ready

### "Database does not exist" error
The database `prismadb` is auto-created by the PostgreSQL container on first start.

### Port 5432 already in use
Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use host port 5433
```

Then update `.env.local`:
```
DATABASE_URL="postgresql://admin:adminpassword@localhost:5433/prismadb?schema=public"
```

### Prisma migration fails
Make sure PostgreSQL is fully started:
```bash
docker-compose logs postgres
```

Wait for logs showing: "database system is ready to accept connections"

---

## Project Structure

```
urcheck/
├── app/
│   ├── api/
│   │   ├── verify/route.ts      # POST - Verify barcode
│   │   ├── product/[sku]/route.ts  # GET - Product by SKU
│   │   └── health/route.ts      # GET - Health check
│   ├── layout.tsx
│   ├── page.tsx                 # Main page with barcode scanner
│   └── globals.css
├── components/
│   ├── BarcodeScanner.tsx      # Barcode scanner component
│   ├── ProductInfo.tsx         # Product display
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Footer.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── db.ts                   # Prisma client
│   ├── supabase.ts             # Supabase client (optional)
│   └── validators.ts           # Zod schemas
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Sample data
│   └── migrations/
├── types/
│   ├── product.ts
│   └── database.ts             # Generated from Prisma
├── .env.local                  # Your environment variables
├── .env.example                # Template
├── TASKS_PLAN.md               # Full task plan
└── package.json
```

---

## Next Steps After Setup

Check `TASKS_PLAN.md` for remaining tasks:
- UI/UX improvements
- Testing setup
- Security features (rate limiting, security headers)
- Documentation
- Deployment configuration
