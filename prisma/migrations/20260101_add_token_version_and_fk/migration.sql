-- Add tokenVersion to AdminUser and CustomerAccount
-- Make CustomerAccount.password NOT NULL
-- Add FK from scan_logs.customerId to CustomerAccount

ALTER TABLE "AdminUser" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "CustomerAccount" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- password is currently nullable; no NULL rows exist, so we can set NOT NULL
UPDATE "CustomerAccount" SET "password" = '' WHERE "password" IS NULL;
ALTER TABLE "CustomerAccount" ALTER COLUMN "password" SET NOT NULL;

-- Add FK scan_logs.customerId -> CustomerAccount (idempotent: only if not present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'scan_logs_customerId_fkey'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE "scan_logs"
      ADD CONSTRAINT "scan_logs_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
