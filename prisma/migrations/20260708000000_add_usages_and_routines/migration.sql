-- Migration: reconcile Product with current schema, add routines table
-- Idempotent: safe to run once on the production DB regardless of how it was provisioned.

-- 1) Drop stale columns left by the old database.sql (NOT NULL ones break inserts/seed)
ALTER TABLE "Product" DROP COLUMN IF EXISTS "sku";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "batchNumber";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "companyName";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "companyAddress";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "cons";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "pros";

-- 2) Add columns the schema expects but the live DB lacks
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "usages" TEXT[];
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "usageInstructions" TEXT[];
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "expiresInMonths" INTEGER;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "brandName" TEXT NOT NULL DEFAULT '';

-- 3) routines table (parent of routine_items)
CREATE TABLE IF NOT EXISTS "routines" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "shareToken" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "routines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "routines_customerId_idx" ON "routines"("customerId");
CREATE INDEX IF NOT EXISTS "routines_isPublic_idx" ON "routines"("isPublic");
CREATE UNIQUE INDEX IF NOT EXISTS "routines_shareToken_key" ON "routines"("shareToken");

ALTER TABLE "routines" ADD CONSTRAINT "routines_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4) routine_items (ensure exists, then wire FKs)
CREATE TABLE IF NOT EXISTS "routine_items" (
  "id" TEXT NOT NULL,
  "routineId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "brandName" TEXT,
  "imageUrl" TEXT,
  "timeOfDay" TEXT NOT NULL DEFAULT 'night',
  "order" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "routine_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "routine_items_routineId_idx" ON "routine_items"("routineId");
CREATE INDEX IF NOT EXISTS "routine_items_productId_idx" ON "routine_items"("productId");

ALTER TABLE "routine_items" ADD CONSTRAINT "routine_items_routineId_fkey"
  FOREIGN KEY ("routineId") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "routine_items" ADD CONSTRAINT "routine_items_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
