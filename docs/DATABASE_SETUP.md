# Database Setup Guide for UrCheck

Hướng dẫn đầy đủ setup database cho dự án **UrCheck** — hỗ trợ cả 2 môi trường:

- **Local development** (Docker Postgres trên máy)
- **Production** (Supabase Postgres trên Vercel)

> 📅 **Cập nhật lần cuối:** 2026-06-26 — verified working với Supabase + Vercel production

---

## 📋 Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Local Development (Docker)](#2-local-development-docker)
3. [Production (Supabase)](#3-production-supabase)
4. [Setup lần đầu cho production](#4-setup-lần-đầu-cho-production)
5. [Cấu trúc file env](#5-cấu-trúc-file-env)
6. [Các lệnh Prisma thường dùng](#6-các-lệnh-prisma-thường-dùng)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Tổng quan kiến trúc

### 3 môi trường, 2 file env

| Môi trường | DB | Đọc env từ |
|------------|-----|-----------|
| **Local dev** (`npm run dev`) | Docker Postgres | `.env.local` |
| **Local migration/seed** (`npx prisma migrate deploy`) | Supabase hoặc Docker | `.env` |
| **Vercel production** | Supabase | Dashboard Environment Variables |

### Quan trọng: 2 file env độc lập

| File | Đọc bởi | Mục đích |
|------|---------|---------|
| `.env` | Prisma CLI (migrate, seed, studio) | Chạy lệnh admin DB |
| `.env.local` | Next.js dev | Chạy `npm run dev` |

> ⚠️ **Prisma CLI KHÔNG đọc `.env.local`**, chỉ đọc `.env`. Đây là lý do phổ biến gây lỗi "Can't reach database" khi migrate.

### Schema tổng quan (7 bảng)

```
AdminUser ─┬─ Product ─┬─ ProductImage
           │           ├─ ProductVersion
           │           ├─ Barcode (table: barcodes) — DEPRECATED, hidden by flag
           │           └─ QrCode (table: qr_codes) — ACTIVE
           │
           └─ ScanLog (table: scan_logs)

UserRole: ADMIN, CUSTOMER
ProductStatus: DRAFT, PUBLISHED, ARCHIVED
```

---

## 2. Local Development (Docker)

### Yêu cầu
- Docker Desktop đang chạy
- Port `5432` chưa bị chiếm
- Node.js 18+ installed

### Step 1: Start PostgreSQL Container

Từ folder `D:\Docker Compose`:

```bash
cd "D:\Docker Compose"
docker-compose up -d
```

Container sẽ chạy với:
- **Host:** localhost
- **Port:** 5432
- **Database:** prismadb
- **Username:** admin
- **Password:** adminpassword

Verify:
```bash
docker-compose ps
```

Mong đợi thấy: `prisma-postgres Up About ...`

### Step 2: Generate Prisma Client

```bash
cd "D:\Thực tập\urcheck\urcheck"
npx prisma generate
```

✅ Prisma client sẵn sàng tại `node_modules/@prisma/client`

### Step 3: Run Database Migrations

```bash
npx prisma migrate deploy
```

> 💡 Dùng `migrate deploy` (không phải `migrate dev`) vì migrations đã được commit sẵn trong folder `prisma/migrations/`. Lệnh này chỉ apply, KHÔNG tạo migration mới.

### Step 4: Seed the Database

```bash
npm run seed
```

Sẽ tạo:
- 4 sample products (3 valid + 1 expired)
- Barcodes (EAN-13/EAN-8) cho mỗi sản phẩm
- QR codes cho mỗi sản phẩm
- Admin user: `admin / admin123`

Output mẫu:
```
✅ Created admin user: admin / admin123
Created product: Serum Vitamin C 10% - The Ordinary
  barcode: 8934012345670 | status: ✅ VALID
  QR:      XXXXXX  →  http://localhost:3000/?q=XXXXXX
✅ Seed completed successfully!
Total products: 4
```

### Step 5: Verify Setup

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "urcheck API",
  "version": "1.0.0",
  "database": { "status": "ok" }
}
```

### Step 6: Start Development Server

```bash
npm run dev
```

Mở http://localhost:3000

---

## 3. Production (Supabase)

### Kiến trúc Supabase
- **Project ref:** `xsaaxmcejqygsdmewlmc`
- **Region:** `aws-1-ap-northeast-1` (Tokyo)
- **Password:** `urcheck-prod-dtp-2026` (đặt trong Dashboard → Settings → Database → Database password)

### 2 connection string cần biết

| Type | Host | Port | Dùng cho |
|------|------|------|----------|
| **Transaction pooler** | `aws-1-ap-northeast-1.pooler.supabase.com` | `6543` | ✅ Production runtime + Migration từ xa |
| **Direct connection** (internal) | `db.xsaaxmcejqygsdmewlmc.supabase.co` | `5432` | Chỉ trong cùng region Supabase (cần Pro plan cho IPv4) |

> 💡 **Tại sao dùng pooler?**
> - Direct connection (`db.xxx.supabase.co`) chỉ chấp nhận IPv6, cần Supabase Pro trở lên mới có IPv4
> - Pooler (`pooler.supabase.com`) hoạt động từ mọi nơi (IPv4 + IPv6), free tier OK

### Cấu hình trên Vercel (Environment Variables)

Vào https://vercel.com/dashboard → project `urcheck` → Settings → Environment Variables, thêm 7 biến sau:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres.xsaaxmcejqygsdmewlmc:***@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres` |
| `DIRECT_URL` | `postgresql://postgres.xsaaxmcejqygsdmewlmc:***@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `NEXT_PUBLIC_BASE_URL` | `https://urcheck.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xsaaxmcejqygsdmewlmc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<anon-jwt-token>` |
| `SUPABASE_SERVICE_ROLE_KEY` | `<service-role-jwt-token>` |
| `UPLOAD_SECRET_KEY` | `<storage-secret>` |

⚠️ **Quan trọng:**
- Tick cả 3 environment: Production, Preview, Development
- Thay `***` bằng password thật (`urcheck-prod-dtp-2026`)
- Password trong URL **không cần** URL-encode nếu chỉ chứa chữ thường + số + gạch ngang
- `NEXT_PUBLIC_BASE_URL` rất quan trọng — QR code sinh ra sẽ embed URL này

---

## 4. Setup lần đầu cho production

> ⚠️ Làm 1 lần duy nhất khi: lần đầu deploy project, hoặc sau khi thay đổi schema

### Bước 1: Backup `.env` cũ
```powershell
cd "D:\Thực tập\urcheck\urcheck"
Copy-Item .env .env.backup -Force
```

### Bước 2: Sửa `.env` tạm thời trỏ vào Supabase
```powershell
notepad .env
```

Sửa 2 dòng `DATABASE_URL` và `DIRECT_URL`:

```ini
DATABASE_URL="postgresql://postgres.xsaaxmcejqygsdmewlmc:***@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xsaaxmcejqygsdmewlmc:***@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

⚠️ Thay `***` bằng `urcheck-prod-dtp-2026`. Save file.

### Bước 3: Test kết nối (optional)
```powershell
npx prisma db pull --print
```

Mong đợi: in ra schema Prisma (không lỗi).

### Bước 4: Chạy migration (tạo tables)
```powershell
npx prisma migrate deploy
```

**Mong đợi:**
```
Datasource "db": PostgreSQL database "postgres", schema "public"
at "aws-1-ap-northeast-1.pooler.supabase.com:6543"

4 migrations found in prisma/migrations
Applying migration `20260619155014_extend_schema`
All migrations have been successfully applied.
```

> Nếu lỗi "prepared statement s0 already exists" → đã có `?pgbouncer=true` trong DIRECT_URL (Bước 2), chạy lại.

### Bước 5: Verify tables trên Supabase
1. Vào https://supabase.com/dashboard/project/xsaaxmcejqygsdmewlmc/editor
2. Click **Table Editor** (sidebar trái)
3. Mong đợi thấy 7 tables: `AdminUser`, `Product`, `ProductImage`, `ProductVersion`, `barcodes`, `qr_codes`, `scan_logs`

### Bước 6: Seed data
```powershell
npm run seed
```

**Mong đợi:**
```
✅ Created admin user: admin / admin123
Created product: Serum Vitamin C 10% - The Ordinary
  QR:  XXXXXX
[3 sản phẩm khác]
✅ Seed completed successfully!
```

### Bước 7: Restore `.env` về localhost
```powershell
notepad .env
```

Sửa 2 dòng `DATABASE_URL` và `DIRECT_URL`:

```ini
DATABASE_URL="postgresql://admin:***@localhost:5432/prismadb?schema=public"
DIRECT_URL="postgresql://admin:***@localhost:5432/prismadb?schema=public"
```

(Thay `***` bằng `adminpassword`)

Save.

### Bước 8: Test production
```powershell
# Health check
curl https://urcheck.vercel.app/api/health

# Login test
curl -X POST "https://urcheck.vercel.app/api/admin/login" `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password": "***"}'
```

---

## 5. Cấu trúc file env

### `.env` (Prisma CLI — KHÔNG commit)

```ini
# Supabase (cũng dùng cho Vercel nếu deploy)
NEXT_PUBLIC_SUPABASE_URL="https://xsaaxmcejqygsdmewlmc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-jwt>"
UPLOAD_SECRET_KEY="<sto...n
# Database — LOCAL cho dev, swap sang Supabase khi migrate
DATABASE_URL="postgresql://admin:***@localhost:5432/prismadb?schema=public"
DIRECT_URL="postgresql://admin:***@localhost:5432/prismadb?schema=public"
```

### `.env.local` (Next.js dev — KHÔNG commit)

```ini
# Supabase client + Storage
NEXT_PUBLIC_SUPABASE_URL="https://xsaaxmcejqygsdmewlmc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-jwt>"
UPLOAD_SECRET_KEY="<sto...n
# Database — LOCAL (Docker Postgres)
DATABASE_URL="postgresql://admin:***@localhost:5432/prismadb?schema=public"
DIRECT_URL="postgresql://admin:***@localhost:5432/prismadb?schema=public"
```

### Vercel Environment Variables (Dashboard)

Xem bảng ở mục [§3 Production](#3-production-supabase).

---

## 6. Các lệnh Prisma thường dùng

### Mở Prisma Studio (GUI xem/sửa DB)
```powershell
npx prisma studio
```
Mở http://localhost:5555

### Xem schema hiện tại của DB
```powershell
npx prisma db pull --print
```

### Tạo migration mới (khi sửa `prisma/schema.prisma`)
```powershell
# 1. Sửa schema.prisma
# 2. Chạy:
npx prisma migrate dev --name ten_migration_moi

# Prisma sẽ tự động:
# - Tạo file SQL trong prisma/migrations/
# - Apply migration vào DB
# - Generate Prisma Client
```

### Apply migration lên DB (production / staging)
```powershell
npx prisma migrate deploy
```

> ⚠️ `migrate deploy` chỉ chạy migrations đã commit, KHÔNG tạo migration mới. An toàn cho production.

### Re-seed DB (xóa + insert lại data)
```powershell
npm run seed
```

> Script `prisma/seed.ts` tự `deleteMany()` toàn bộ rồi insert mới.

### Generate Prisma Client (sau khi sửa schema)
```powershell
npx prisma generate
```

---

## 7. Troubleshooting

### ❌ "Can't reach database server"
- Check `.env` có đúng host/port/password không
- Với Supabase: phải dùng `pooler.supabase.com:6543`, không phải `db.xxx.supabase.co:5432`
- Với Docker: chạy `docker ps` xem container đang chạy không

### ❌ "prepared statement s0 already exists"
- Lỗi này chỉ xảy ra khi migrate qua PgBouncer (Supabase pooler)
- **Fix:** thêm `?pgbouncer=true` vào `DIRECT_URL`:
  ```ini
  DIRECT_URL="postgresql://postgres:***@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  ```

### ❌ "table scan_logs does not exist"
- Migration chưa chạy thành công
- Chạy lại `npx prisma migrate deploy`

### ❌ "Environment variables loaded from .env" (khi chạy Prisma)
- Prisma CLI chỉ đọc `.env`, KHÔNG đọc `.env.local`
- Sửa `.env` chứ không phải `.env.local`

### ❌ Login admin trên Vercel trả "Không kết nối được cơ sở dữ liệu"
- Check Vercel Dashboard → Environment Variables → đã có `DATABASE_URL` chưa
- Check `DATABASE_URL` trên Vercel trỏ đúng Supabase pooler
- Check `/api/health` → nếu `database.status: "down"` thì DB connection fail

### ❌ Camera QR scanner không hoạt động trên production
- Camera cần HTTPS → Vercel đã có sẵn
- Browser cần cho phép camera → check permission icon trên address bar
- Nếu vẫn fail → dùng "Upload ảnh" thay thế

### ❌ QR code in ra URL `localhost:3000`
- `NEXT_PUBLIC_BASE_URL` chưa set trên Vercel Dashboard
- Add env `NEXT_PUBLIC_BASE_URL=https://urcheck.vercel.app` → Save → Vercel tự redeploy

### ❌ Build fail vì "Module not found @/lib/db"
- Chạy `npm install` để cài lại Prisma Client
- Hoặc `npx prisma generate` để regenerate client

### ❌ Port 5432 already in use
Sửa `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use host port 5433
```

Sửa `.env.local`:
```
DATABASE_URL="postgresql://admin:***@localhost:5433/prismadb?schema=public"
```

---

## 🔗 Links hữu ích

- **Supabase Dashboard:** https://supabase.com/dashboard/project/xsaaxmcejqygsdmewlmc
- **Supabase SQL Editor:** https://supabase.com/dashboard/project/xsaaxmcejqygsdmewlmc/sql
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Production URL:** https://urcheck.vercel.app
- **Admin login:** https://urcheck.vercel.app/admin/login (admin / admin123)
- **Prisma Docs:** https://www.prisma.io/docs

---

## 📞 Hỗ trợ

Nếu gặp lỗi không có trong danh sách trên:
1. Copy full error message + screenshot
2. Note lại command đang chạy
3. Check Vercel logs (Deployments → click deployment → Logs)
4. Paste cho team lead để debug