-- ============================================================
-- urcheck — BlogPost & SupportArticle (chỉ phần mới)
-- Chạy trên Supabase SQL Editor. An toàn nếu chạy lại nhiều lần.
-- ============================================================

-- 1) Enum (bỏ qua nếu đã tồn tại)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ContentStatus') THEN
    CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');
  END IF;
END$$;

-- 2) Bảng BlogPost
CREATE TABLE IF NOT EXISTS "BlogPost" (
  "id"          TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "titleVi"     TEXT NOT NULL,
  "titleEn"     TEXT NOT NULL,
  "excerptVi"   TEXT,
  "excerptEn"   TEXT,
  "bodyVi"      TEXT,
  "bodyEn"      TEXT,
  "coverUrl"    TEXT,
  "author"      TEXT,
  "status"      "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- 3) Bảng SupportArticle
CREATE TABLE IF NOT EXISTS "SupportArticle" (
  "id"          TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "titleVi"     TEXT NOT NULL,
  "titleEn"     TEXT NOT NULL,
  "bodyVi"      TEXT,
  "bodyEn"      TEXT,
  "category"    TEXT NOT NULL,
  "status"      "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
  "order"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SupportArticle_pkey" PRIMARY KEY ("id")
);

-- 4) Indexes (bỏ qua nếu đã tồn tại)
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key"     ON "BlogPost"("slug");
CREATE INDEX  IF NOT EXISTS "BlogPost_status_idx"        ON "BlogPost"("status");
CREATE INDEX  IF NOT EXISTS "BlogPost_publishedAt_idx"   ON "BlogPost"("publishedAt");
CREATE INDEX  IF NOT EXISTS "BlogPost_slug_idx"          ON "BlogPost"("slug");

CREATE UNIQUE INDEX IF NOT EXISTS "SupportArticle_slug_key"   ON "SupportArticle"("slug");
CREATE INDEX  IF NOT EXISTS "SupportArticle_status_idx"      ON "SupportArticle"("status");
CREATE INDEX  IF NOT EXISTS "SupportArticle_category_idx"    ON "SupportArticle"("category");
CREATE INDEX  IF NOT EXISTS "SupportArticle_slug_idx"        ON "SupportArticle"("slug");
