-- Migration: Drop the 'sku' column from Product table
-- The 'sku' column was defined in the initial migration but removed from the Prisma schema.
-- This migration aligns the database with the current schema.

-- Drop unique index on sku first
DROP INDEX IF EXISTS "Product_sku_key";

-- Drop regular index on sku
DROP INDEX IF EXISTS "Product_sku_idx";

-- Drop the sku column (NOT NULL, causing insert failures)
ALTER TABLE "Product" DROP COLUMN IF EXISTS "sku";

-- Drop batchNumber column (also NOT NULL from init migration, not in current schema)
ALTER TABLE "Product" DROP COLUMN IF EXISTS "batchNumber";
