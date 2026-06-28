-- =====================================================================
-- UrCheck — Consolidated Schema (Supabase Production)
-- =====================================================================
-- File này gộp 4 Prisma migrations thành 1 script duy nhất.
-- An toàn để chạy nhiều lần (idempotent) — sẽ tự DROP tables cũ trước.
--
-- Sử dụng:
--   1. Vào https://supabase.com/dashboard/project/xsaaxmcejqygsdmewlmc/sql
--   2. New query
--   3. Paste TOÀN BỘ nội dung file này
--   4. Click "Run" (hoặc Ctrl+Enter)
--   5. Chờ "Success. No rows returned"
--   6. Quay lại local, chạy: npm run seed
--
-- Sau khi seed xong, login admin tại:
--   https://urcheck.vercel.app/admin/login
--   Username: admin
--   Password: admin123
-- =====================================================================

-- =====================================================================
-- BƯỚC 1: DROP existing objects (nếu có) — để idempotent
-- =====================================================================
DROP TABLE IF EXISTS "scan_logs" CASCADE;
DROP TABLE IF EXISTS "barcodes" CASCADE;
DROP TABLE IF EXISTS "qr_codes" CASCADE;
DROP TABLE IF EXISTS "ProductImage" CASCADE;
DROP TABLE IF EXISTS "ProductVersion" CASCADE;
DROP TABLE IF EXISTS "AdminUser" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TYPE IF EXISTS "ProductStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- =====================================================================
-- BƯỚC 2: CREATE enums
-- =====================================================================
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER');

-- =====================================================================
-- BƯỚC 3: CREATE tables
-- =====================================================================

-- Product (bảng chính)
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "manufactureDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cons" TEXT[],
    "ingredientAnalysis" TEXT,
    "pros" TEXT[],
    "publishedAt" TIMESTAMP(3),
    "purchaseLinks" JSONB,
    "skinType" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'PUBLISHED',
    "suitableFor" TEXT,
    "tags" TEXT[],

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- AdminUser
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- ProductImage (gallery ảnh của sản phẩm)
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- ProductVersion (history snapshots cho rollback)
CREATE TABLE "ProductVersion" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productSnapshot" JSONB NOT NULL,
    "imageSnapshot" JSONB,
    "changedBy" TEXT NOT NULL,
    "changeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVersion_pkey" PRIMARY KEY ("id")
);

-- Barcode (legacy EAN-13/EAN-8 — hidden in UI behind ENABLE_BARCODE flag)
CREATE TABLE "barcodes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "lastScannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barcodes_pkey" PRIMARY KEY ("id")
);

-- QrCode (ACTIVE flow — dùng cho verification)
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderCode" TEXT,
    "batchCode" TEXT,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "lastScannedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- ScanLog (log mỗi lần user verify QR/barcode)
CREATE TABLE "scan_logs" (
    "id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_logs_pkey" PRIMARY KEY ("id")
);

-- =====================================================================
-- BƯỚC 4: CREATE indexes
-- =====================================================================

-- Product indexes
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_sku_idx" ON "Product"("sku");
CREATE INDEX "Product_batchNumber_idx" ON "Product"("batchNumber");
CREATE INDEX "Product_companyName_idx" ON "Product"("companyName");
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Product_publishedAt_idx" ON "Product"("publishedAt");

-- AdminUser indexes
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- ProductImage indexes
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");
CREATE INDEX "ProductImage_sortOrder_idx" ON "ProductImage"("sortOrder");

-- ProductVersion indexes
CREATE INDEX "ProductVersion_productId_idx" ON "ProductVersion"("productId");
CREATE INDEX "ProductVersion_createdAt_idx" ON "ProductVersion"("createdAt");

-- Barcode indexes
CREATE UNIQUE INDEX "barcodes_code_key" ON "barcodes"("code");
CREATE INDEX "barcodes_code_idx" ON "barcodes"("code");
CREATE INDEX "barcodes_productId_idx" ON "barcodes"("productId");

-- QrCode indexes
CREATE UNIQUE INDEX "qr_codes_code_key" ON "qr_codes"("code");
CREATE INDEX "qr_codes_code_idx" ON "qr_codes"("code");
CREATE INDEX "qr_codes_productId_idx" ON "qr_codes"("productId");
CREATE INDEX "qr_codes_scanCount_idx" ON "qr_codes"("scanCount");

-- ScanLog indexes
CREATE INDEX "scan_logs_barcode_idx" ON "scan_logs"("barcode");
CREATE INDEX "scan_logs_scannedAt_idx" ON "scan_logs"("scannedAt");

-- =====================================================================
-- BƯỚC 5: CREATE foreign keys
-- =====================================================================

ALTER TABLE "ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductVersion"
    ADD CONSTRAINT "ProductVersion_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "barcodes"
    ADD CONSTRAINT "barcodes_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "qr_codes"
    ADD CONSTRAINT "qr_codes_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================================
-- HOÀN THÀNH — bảng đã sẵn sàng
-- =====================================================================
-- 7 tables created:
--   ✓ Product (main)
--   ✓ AdminUser (admin login)
--   ✓ ProductImage (gallery)
--   ✓ ProductVersion (history/rollback)
--   ✓ barcodes (legacy — hidden in UI)
--   ✓ qr_codes (ACTIVE verification)
--   ✓ scan_logs (verify logs)
--
-- Bước tiếp theo:
--   1. Quay lại terminal local
--   2. Đảm bảo `.env` trỏ Supabase (host pooler)
--   3. Chạy: npm run seed
--   4. Login admin: https://urcheck.vercel.app/admin/login (admin / admin123)
-- =====================================================================