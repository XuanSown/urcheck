-- Migration: Add CustomerAccount model
-- Creates table for customer authentication system

CREATE TABLE IF NOT EXISTS "CustomerAccount" (
  "id" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "email" TEXT,
  "password" TEXT,
  "resetToken" TEXT,
  "resetTokenExpiresAt" TIMESTAMP(3),
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CustomerAccount_deviceId_key" ON "CustomerAccount"("deviceId");
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerAccount_email_key" ON "CustomerAccount"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerAccount_resetToken_key" ON "CustomerAccount"("resetToken");
CREATE INDEX IF NOT EXISTS "CustomerAccount_deviceId_idx" ON "CustomerAccount"("deviceId");
CREATE INDEX IF NOT EXISTS "CustomerAccount_createdAt_idx" ON "CustomerAccount"("createdAt");
CREATE INDEX IF NOT EXISTS "CustomerAccount_email_idx" ON "CustomerAccount"("email");
