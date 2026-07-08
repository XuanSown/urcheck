-- Migration: Add missing tables for customer features (v3 - all inside DO)

DO $$
BEGIN
  -- CustomerLoginLog
  CREATE TABLE IF NOT EXISTS "CustomerLoginLog" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "deviceId" TEXT,
    "email" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "action" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerLoginLog_pkey" PRIMARY KEY ("id")
  );
  CREATE INDEX IF NOT EXISTS "CustomerLoginLog_customerId_idx" ON "CustomerLoginLog"("customerId");
  CREATE INDEX IF NOT EXISTS "CustomerLoginLog_deviceId_idx" ON "CustomerLoginLog"("deviceId");
  CREATE INDEX IF NOT EXISTS "CustomerLoginLog_createdAt_idx" ON "CustomerLoginLog"("createdAt");
  CREATE INDEX IF NOT EXISTS "CustomerLoginLog_email_idx" ON "CustomerLoginLog"("email");
  CREATE INDEX IF NOT EXISTS "CustomerLoginLog_action_idx" ON "CustomerLoginLog"("action");

  -- UserFavorite
  CREATE TABLE IF NOT EXISTS "UserFavorite" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("id")
  );
  CREATE UNIQUE INDEX IF NOT EXISTS "UserFavorite_customerId_productId_key" ON "UserFavorite"("customerId", "productId");
  CREATE INDEX IF NOT EXISTS "UserFavorite_customerId_idx" ON "UserFavorite"("customerId");

  -- Collection
  CREATE TABLE IF NOT EXISTS "Collection" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
  );
  CREATE INDEX IF NOT EXISTS "Collection_customerId_idx" ON "Collection"("customerId");

  -- CollectionItem
  CREATE TABLE IF NOT EXISTS "CollectionItem" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
  );
  CREATE INDEX IF NOT EXISTS "CollectionItem_collectionId_idx" ON "CollectionItem"("collectionId");
  CREATE INDEX IF NOT EXISTS "CollectionItem_productId_idx" ON "CollectionItem"("productId");

  -- ProductReview
  CREATE TABLE IF NOT EXISTS "ProductReview" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
  );
  CREATE INDEX IF NOT EXISTS "ProductReview_customerId_idx" ON "ProductReview"("customerId");
  CREATE INDEX IF NOT EXISTS "ProductReview_productId_idx" ON "ProductReview"("productId");
  CREATE UNIQUE INDEX IF NOT EXISTS "ProductReview_customerId_productId_key" ON "ProductReview"("customerId", "productId");

  -- RoutineItem
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
END $$;

-- CustomerId into scan_logs (standalone - no IF outside DO)
ALTER TABLE "scan_logs" ADD COLUMN IF NOT EXISTS "deviceId" TEXT;
ALTER TABLE "scan_logs" ADD COLUMN IF NOT EXISTS "customerId" TEXT;
CREATE INDEX IF NOT EXISTS "scan_logs_customerId_idx" ON "scan_logs"("customerId");
