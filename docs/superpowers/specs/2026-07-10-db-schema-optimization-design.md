# DB Schema Optimization — Design

**Date:** 2026-07-10
**Scope:** Prune unused tables, remove denormalized fields, normalize types/FKs, trim redundant indexes on the urcheck Prisma schema.

## Goal

Make the Prisma schema lean and correctly normalized (gọn schema + chuẩn hóa) without changing app behavior or removing any feature that code actually uses.

## Method (Approach A — approved)

Local machine cannot reach Supabase (P1001), so `prisma migrate dev` / `prisma db push` cannot run here. Therefore:
- Update `prisma/schema.prisma` to the target state.
- Hand-write a manual SQL migration `prisma/migrations/optimize_schema/supabase_manual.sql` that applies the exact DDL changes (DROP / ALTER / CREATE INDEX) to the live Supabase DB.
- User runs that SQL in the Supabase SQL Editor, same as `seed_admin.sql`.
- The migration folder also contains the `prisma migrate` convention so `prisma migrate deploy` stays consistent if ever run.

## Changes

### 1. Drop unused tables (only referenced by migration.sql, never queried by TS code)

| Table | Reason |
| --- | --- |
| `IngredientFlag` | 0 TS references; static seed data never consumed |
| `ExpiryAlert` | 0 TS references |
| `ReviewHelpful` | 0 TS references |

→ `DROP TABLE IF EXISTS "IngredientFlag" CASCADE;`
→ `DROP TABLE IF EXISTS "ExpiryAlert" CASCADE;`
→ `DROP TABLE IF EXISTS "ReviewHelpful" CASCADE;`

### 2. Remove denormalized fields (chuẩn hóa hết)

- `Product.imageUrl String?` → **remove**. Consumers read primary image via `ProductImage` (`isPrimary`).
- `RoutineItem.productName / brandName / imageUrl` → **remove**. Render layer joins `product` relation for these.
- `ProductVersion.imageSnapshot Json?` → **remove** (keep `productSnapshot`).

### 3. Normalize types

- `Badge.criteriaJson String` → `Json` (currently stores raw JSON in a text column).
  - SQL: `ALTER TABLE "badges" ALTER COLUMN "criteriaJson" TYPE jsonb USING "criteriaJson"::jsonb;`

### 4. Normalize foreign key: ScanLog → QrCode

- Remove loose `ScanLog.qrCode String`.
- Add `qrCodeId String` + relation `qrCode QrCode @relation(fields:[qrCodeId], references:[id], onDelete: Cascade)`.
- SQL:
  ```sql
  ALTER TABLE "scan_logs" DROP COLUMN IF EXISTS "qrCode";
  ALTER TABLE "scan_logs" ADD COLUMN "qrCodeId" text NOT NULL;
  ALTER TABLE "scan_logs" ADD CONSTRAINT "scan_logs_qrCodeId_fkey"
    FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  CREATE INDEX IF NOT EXISTS "scan_logs_qrCodeId_idx" ON "scan_logs"("qrCodeId");
  ```
- Code path writing `ScanLog` must set `qrCodeId` instead of `qrCode`. (Confirmed only 2 files reference ScanLog — update both.)

### 5. Trim redundant indexes

- `QrCode @@index([scanCount])` → remove (not used in queries).
- Keep all other indexes; they back existing list/filter queries.

## Code updates required (outside schema)

- `lib/` / `app/api` writing `ScanLog`: set `qrCodeId` (lookup from QrCode by code first).
- Any consumer of `Product.imageUrl`: switch to primary `ProductImage`.
- `RoutineItem` rendering: read `product.name / product.brandName / product.imageUrl` instead of snapshot fields.

## Risks / Notes

- Dropping tables is irreversible — but they hold no app data (never written by code). Safe.
- Manual SQL must be run on Supabase before deploying code that expects new schema, else runtime errors. Deploy order: run SQL → `prisma generate` → `npm run build` → deploy.
- `prisma generate` must run after schema change so client matches.
- No DB migration auto-gen possible locally; `supabase_manual.sql` is the source of truth for the live DB.

## Verification

1. `npx tsc --noEmit` passes after code updates.
2. `npm run build` succeeds.
3. Supabase: run `supabase_manual.sql`, confirm tables dropped and columns altered.
4. `/api/health` still `database.status: ok`.
5. Live smoke: `/` 200, scan a product writes ScanLog with `qrCodeId`.
