-- Incremental migration: admin hardening (WS4 + WS9)
-- Adds CustomerAccount.isActive, AdminUser 2FA columns, and admin_login_logs table.
-- Run in Supabase SQL Editor. The rest of the schema already matches.

-- 1. CustomerAccount.isActive (WS4)
ALTER TABLE "CustomerAccount" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- 2. AdminUser 2FA (WS9)
ALTER TABLE "AdminUser" ADD COLUMN "twoFactorSecret" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

-- 3. admin_login_logs table (WS9)
CREATE TABLE "admin_login_logs" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT,
    "username" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_login_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_login_logs_adminUserId_idx" ON "admin_login_logs"("adminUserId");
CREATE INDEX "admin_login_logs_username_idx" ON "admin_login_logs"("username");
CREATE INDEX "admin_login_logs_createdAt_idx" ON "admin_login_logs"("createdAt");

ALTER TABLE "admin_login_logs"
    ADD CONSTRAINT "admin_login_logs_adminUserId_fkey"
    FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
