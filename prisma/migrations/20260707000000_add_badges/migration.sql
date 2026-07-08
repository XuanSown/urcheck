-- Migration: Add Badge and CustomerBadge models
-- Creates tables for user badge achievement system

-- Create badges table
CREATE TABLE IF NOT EXISTS "badges" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "descriptionVi" TEXT NOT NULL,
  "descriptionEn" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "criteriaJson" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- Create unique index on badge name
CREATE UNIQUE INDEX IF NOT EXISTS "badges_name_key" ON "badges"("name");

-- Create customer_badges table
CREATE TABLE IF NOT EXISTS "customer_badges" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "customer_badges_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on customerId + badgeId
CREATE UNIQUE INDEX IF NOT EXISTS "customer_badges_customerId_badgeId_key" ON "customer_badges"("customerId", "badgeId");

-- Create index on customerId for faster lookups
CREATE INDEX IF NOT EXISTS "customer_badges_customerId_idx" ON "customer_badges"("customerId");

-- Add foreign key constraint
ALTER TABLE "customer_badges" ADD CONSTRAINT "customer_badges_badgeId_fkey"
  FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
