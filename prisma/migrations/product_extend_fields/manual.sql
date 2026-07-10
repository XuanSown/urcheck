-- Incremental migration: extend Product for authenticity platform (WS product form)
-- Adds batchNumber, category, certifications. Run in Supabase SQL Editor.

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "batchNumber" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "certifications" TEXT[];

CREATE INDEX IF NOT EXISTS "Product_batchNumber_idx" ON "Product"("batchNumber");
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");
