-- ============================================================
-- urcheck schema optimization (manual)
-- Run in Supabase SQL Editor. Idempotent where possible.
-- Local cannot reach Supabase (P1001), so this is applied by hand.
-- ============================================================
--
-- NOTE: intentionally NOT wrapped in BEGIN;...COMMIT; so a failure in the
-- ScanLog backfill/NOT NULL step cannot roll back the earlier table/column
-- drops on the user's live DB. Each step is independently idempotent.

-- 1) Drop unused tables
DROP TABLE IF EXISTS "IngredientFlag" CASCADE;
DROP TABLE IF EXISTS "ExpiryAlert" CASCADE;
DROP TABLE IF EXISTS "ReviewHelpful" CASCADE;

-- 2) Product: drop imageUrl
ALTER TABLE "Product" DROP COLUMN IF EXISTS "imageUrl";

-- 3) ProductVersion: drop imageSnapshot
ALTER TABLE "ProductVersion" DROP COLUMN IF EXISTS "imageSnapshot";

-- 4) RoutineItem: drop snapshot fields
-- NOTE: each statement below runs outside a single transaction so a failure in
-- step 6 cannot roll back the earlier drops on the live DB.
ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "productName";
ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "brandName";
ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "imageUrl";

-- 5) Badge: criteriaJson text -> jsonb
-- Use a DO block so it only runs when the column is still text.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'badges'
      AND column_name = 'criteriaJson'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE "badges" ALTER COLUMN "criteriaJson" TYPE jsonb USING "criteriaJson"::jsonb;
  END IF;
END $$;

-- 6) ScanLog: replace qrCode string with qrCodeId FK (safe backfill)
-- scan_logs may already hold rows where "qrCode" stores a 'QR:<code>' string.
-- We backfill qrCodeId by joining to qr_codes before adding the FK / NOT NULL.

-- 6a) Add nullable qrCodeId if it does not exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scan_logs' AND column_name = 'qrCodeId'
  ) THEN
    ALTER TABLE "scan_logs" ADD COLUMN "qrCodeId" text;
  END IF;
END $$;

-- 6b) Backfill existing rows by matching the stored 'QR:<code>' format
UPDATE "scan_logs" s
SET "qrCodeId" = q."id"
FROM "qr_codes" q
WHERE s."qrCodeId" IS NULL
  AND s."qrCode" IS NOT NULL
  AND s."qrCode" = 'QR:' || q."code";

-- 6c) Delete orphan scan_logs rows whose qrCode did not match any qr_codes.code
-- (analytics logs, safe to drop). This guarantees no NULL qrCodeId remains
-- before SET NOT NULL.
DELETE FROM "scan_logs" WHERE "qrCodeId" IS NULL;

-- 6d) Add the FK constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'scan_logs_qrCodeId_fkey'
      AND table_name = 'scan_logs'
  ) THEN
    ALTER TABLE "scan_logs"
      ADD CONSTRAINT "scan_logs_qrCodeId_fkey"
      FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 6e) Enforce NOT NULL once backfilled (no NULL remains after 6c)
ALTER TABLE "scan_logs" ALTER COLUMN "qrCodeId" SET NOT NULL;

-- 6f) Drop the old qrCode column
ALTER TABLE "scan_logs" DROP COLUMN IF EXISTS "qrCode";

-- 6g) Index on qrCodeId
CREATE INDEX IF NOT EXISTS "scan_logs_qrCodeId_idx" ON "scan_logs"("qrCodeId");

-- 7) QrCode: drop redundant scanCount index (column kept)
DROP INDEX IF EXISTS "QrCode_scanCount_idx";
