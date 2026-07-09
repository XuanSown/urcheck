# DB Schema Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prune unused tables, remove denormalized fields, normalize types/FKs on the urcheck Prisma schema — without changing any feature behavior.

**Architecture:** Update `prisma/schema.prisma` to the target state, hand-write a manual SQL migration (`supabase_manual.sql`) that the user runs in the Supabase SQL Editor (local cannot reach DB, P1001), then update the TS code paths that read/write the changed columns so they use relations instead of the removed fields. `prisma generate` keeps the client in sync.

**Tech Stack:** Prisma 5, PostgreSQL (Supabase), Next.js 16 App Router, TypeScript, Zod.

## Global Constraints

- Local machine cannot reach Supabase → do NOT run `prisma migrate dev`/`db push`/seed locally (all fail with P1001). Apply DDL via the manual `supabase_manual.sql` run in Supabase SQL Editor.
- Never use `prisma migrate push` (project rule).
- Run order: (1) run `supabase_manual.sql` on Supabase, (2) `npx prisma generate`, (3) `npm run build`, (4) deploy. Code expecting the new schema must ship only after SQL is applied.
- Keep snake_case table names via `@@map`; Prisma model names stay PascalCase.
- Every task ends with a commit. Each commit message is prefixed with the task scope.

---

### Task 1: Update Prisma schema (prune + normalize)

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:** None (schema-only). Later tasks consume the regenerated client types.

- [ ] **Step 1: Edit `prisma/schema.prisma`**

Remove unused models (delete these entire model blocks):

```prisma
model IngredientFlag {
  id            String  @id @default(cuid())
  name          String  @unique
  nameVi        String?
  category      String
  riskLevel     String
  description   String?
  descriptionVi String?
  skinWarnings  Json?

  @@index([category])
  @@index([riskLevel])
}
```

```prisma
model ExpiryAlert {
  id          String   @id @default(cuid())
  customerId  String
  productId   String
  alertDate   DateTime
  monthBefore Int
  notified    Boolean  @default(false)
  createdAt   DateTime @default(now())

  customer CustomerAccount @relation(fields: [customerId], references: [id], onDelete: Cascade)
  product  Product         @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([customerId])
  @@index([productId])
  @@index([alertDate])
  @@index([customerId, alertDate])
}
```

```prisma
model ReviewHelpful {
  id         String @id @default(cuid())
  reviewId   String
  customerId String

  review   ProductReview   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  customer CustomerAccount @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@unique([reviewId, customerId])
  @@index([reviewId])
  @@index([customerId])
}
```

In `Product`, remove the `imageUrl` field and its relation no longer references it (nothing else changes):

```prisma
model Product {
  // ... keep all fields EXCEPT:
  // imageUrl           String?   <-- DELETE this line
  // ...
}
```

In `ProductVersion`, remove `imageSnapshot`:

```prisma
model ProductVersion {
  // ... keep id, productId, productSnapshot, changedBy, changeReason, createdAt
  // DELETE: imageSnapshot Json?
}
```

In `RoutineItem`, remove the three snapshot fields:

```prisma
model RoutineItem {
  // ... keep id, routineId, productId, timeOfDay, order, notes, createdAt
  // DELETE: productName String
  // DELETE: brandName   String?
  // DELETE: imageUrl    String?
}
```

In `Badge`, change `criteriaJson` type:

```prisma
model Badge {
  // ...
  criteriaJson  Json
  // ...
}
```

In `ScanLog`, replace loose `qrCode` String with FK `qrCodeId`:

```prisma
model ScanLog {
  id         String   @id @default(cuid())
  qrCodeId   String
  customerId String?
  deviceId   String?
  ipAddress  String?
  userAgent  String?
  scannedAt  DateTime @default(now())

  qrCode QrCode @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)

  @@index([qrCodeId])
  @@index([scannedAt])
  @@index([customerId])
  @@index([deviceId])
  @@map("scan_logs")
}
```

In `QrCode`, remove the redundant `scanCount` index (keep `code` and `productId` indexes):

```prisma
model QrCode {
  // ...
  // DELETE: @@index([scanCount])
}
```

- [ ] **Step 2: Regenerate client and typecheck**

Run: `npx prisma generate && npx tsc --noEmit`
Expected: generate succeeds; tsc will now show errors in the code paths that still use removed fields (expected — fixed in later tasks). Note those files; do not fix here.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "schema: prune unused tables, denormalize fields, normalize FK/types"
```

---

### Task 2: Write manual Supabase migration SQL

**Files:**
- Create: `prisma/migrations/optimize_schema/supabase_manual.sql`

**Interfaces:** Produces the DDL the user applies to the live DB. Must match Task 1 exactly.

- [ ] **Step 1: Write the SQL file**

```sql
-- ============================================================
-- urcheck schema optimization (manual)
-- Run in Supabase SQL Editor. Idempotent where possible.
-- ============================================================

-- 1) Drop unused tables
DROP TABLE IF EXISTS "IngredientFlag" CASCADE;
DROP TABLE IF EXISTS "ExpiryAlert" CASCADE;
DROP TABLE IF EXISTS "ReviewHelpful" CASCADE;

-- 2) Product: drop imageUrl
ALTER TABLE "Product" DROP COLUMN IF EXISTS "imageUrl";

-- 3) ProductVersion: drop imageSnapshot
ALTER TABLE "ProductVersion" DROP COLUMN IF EXISTS "imageSnapshot";

-- 4) RoutineItem: drop snapshot fields
ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "productName";
ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "brandName";
ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "imageUrl";

-- 5) Badge: criteriaJson text -> jsonb
ALTER TABLE "badges" ALTER COLUMN "criteriaJson" TYPE jsonb USING "criteriaJson"::jsonb;

-- 6) ScanLog: replace qrCode string with qrCodeId FK
ALTER TABLE "scan_logs" DROP COLUMN IF EXISTS "qrCode";
ALTER TABLE "scan_logs" ADD COLUMN "qrCodeId" text NOT NULL DEFAULT '';
ALTER TABLE "scan_logs" ADD CONSTRAINT "scan_logs_qrCodeId_fkey"
  FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "scan_logs_qrCodeId_idx" ON "scan_logs"("qrCodeId");

-- 7) QrCode: drop redundant scanCount index (column kept)
DROP INDEX IF EXISTS "QrCode_scanCount_idx";
```

- [ ] **Step 2: Sanity-check the SQL for typos (no execution locally)**

Read the file back and confirm table/column names match `schema.prisma` (`Product`, `ProductVersion`, `routine_items`, `badges`, `scan_logs`, `qr_codes`).

- [ ] **Step 3: Commit**

```bash
git add prisma/migrations/optimize_schema/supabase_manual.sql
git commit -m "migrations: manual SQL to optimize schema on Supabase"
```

---

### Task 3: Fix ScanLog write path (qr/[code] route)

**Files:**
- Modify: `app/api/qr/[code]/route.ts:85-105`

**Interfaces:**
- Consumes: `qrCode.id` (already available as `qrCode.id` in scope at line 98).
- Produces: `scanLog.create({ data: { qrCodeId: qrCode.id, ... } })` — used by Task 6 verification.

- [ ] **Step 1: Replace the `trackData` block**

At `app/api/qr/[code]/route.ts`, change lines 85-105 so `qrCode` is stored as `qrCodeId` instead of the `QR:`-prefixed string:

```ts
        const trackData: {
          qrCodeId: string;
          ipAddress: string | null;
          userAgent: string | null;
          customerId?: string;
        } = {
          qrCodeId: qrCode.id,
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
        };
        if (session) {
          trackData.customerId = session.customerId;
        }

        await prisma.qrCode.update({
          where: { id: qrCode.id },
          data: {
            scanCount: { increment: 1 },
            lastScannedAt: new Date(),
          },
        });
        await prisma.scanLog.create({ data: trackData });
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no error in this file.

- [ ] **Step 3: Commit**

```bash
git add app/api/qr/\[code\]/route.ts
git commit -m "fix: ScanLog writes qrCodeId FK instead of qrCode string"
```

---

### Task 4: Fix ScanLog read paths (badge-service, feed, history)

**Files:**
- Modify: `lib/badge-service.ts:25-43`
- Modify: `app/api/feed/route.ts:18-38`
- Modify: `app/api/customer/history/route.ts:14-82`

**Interfaces:**
- Consumes: `scanLog.qrCodeId` (FK) from Task 1.
- Produces: same downstream shapes as before (brand names, product ids, history items).

- [ ] **Step 1: Fix `lib/badge-service.ts`**

Replace lines 25-43 so it reads `qrCodeId` and joins the `qrCode` relation for the code:

```ts
  const scanLogs = await prisma.scanLog.findMany({
    where: { customerId },
    select: { scannedAt: true, qrCodeId: true },
    orderBy: { scannedAt: 'asc' },
  });

  const qrIds = scanLogs.map((l) => l.qrCodeId).filter(Boolean);
  const qrRecords = qrIds.length
    ? await prisma.qrCode.findMany({
        where: { id: { in: qrIds } },
        select: { code: true, product: { select: { brandName: true } } },
      })
    : [];

  const productByCode = new Map(qrRecords.map((r) => [r.code, r.product?.brandName ?? null]));
  const codeSet = new Set(qrRecords.map((r) => r.code));

  const totalScans = scanLogs.length;
  const brands = new Set(qrRecords.map((r) => r.product?.brandName).filter(Boolean));
  const uniqueDays = new Set(scanLogs.map((l) => localDate(new Date(l.scannedAt)))).size;
```

(Remove the `l.qrCode!.replace('QR:', '')` usages; `badge-service.ts` no longer needs to parse codes — `productByCode` keyed by code is still used by the loop at line 43, which now references `productByCode.get(r.code)`.)

- [ ] **Step 2: Fix `app/api/feed/route.ts`**

Replace lines 18-38 so it maps `qrCodeId`:

```ts
  const [scanLogs, favorites] = await Promise.all([
    prisma.scanLog.findMany({
      where: { customerId },
      select: { qrCodeId: true },
      take: 50,
      orderBy: { scannedAt: 'desc' },
    }),
    prisma.userFavorite.findMany({
      where: { customerId },
      include: { product: { select: { brandName: true, skinType: true } } },
    }),
  ]);

  const qrCodes = await prisma.qrCode.findMany({
    where: { id: { in: scanLogs.map((s: any) => s.qrCodeId) } },
    select: { id: true, code: true, productId: true },
  });
  const idToProductId = new Map(qrCodes.map((q: any) => [q.id, q.productId]));
  const scannedProductIds = new Set(
    scanLogs.map((s: any) => idToProductId.get(s.qrCodeId)).filter(Boolean)
  );
```

- [ ] **Step 3: Fix `app/api/customer/history/route.ts`**

Replace lines 14-50 to include the `qrCode` relation and read `product` through it. Replace the `scanLogs.findMany` select and the qrRecords lookup:

```ts
  const [logs, total] = await Promise.all([
    prisma.scanLog.findMany({
      where: { customerId: guard.session.customerId },
      orderBy: { scannedAt: 'desc' },
      skip,
      take: limit,
      include: {
        qrCode: {
          select: {
            code: true,
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                brandName: true,
                verified: true,
                manufactureDate: true,
                expiryDate: true,
                images: { where: { isPrimary: true }, take: 1, select: { url: true } },
              },
            },
          },
        },
      },
    }),
    prisma.scanLog.count({ where: { customerId: guard.session.customerId } }),
  ]);

  const items = logs.map((log) => {
    const qr = log.qrCode;
    const product = qr?.product;
    const imageUrl = product?.images?.[0]?.url ?? null;
    const isExpired = product?.expiryDate ? new Date(product.expiryDate) < new Date() : false;
    const isValid = product?.verified && !isExpired;
    return {
      scannedAt: log.scannedAt.toISOString(),
      isValid: isValid ?? false,
      status: isValid ? 'valid' : isExpired ? 'expired' : 'unverified',
      product: product
        ? {
            id: product.id,
            name: product.name,
            brandName: product.brandName,
            imageUrl,
            verified: product.verified,
            expiryDate: product.expiryDate ? product.expiryDate.toISOString() : null,
          }
        : null,
      qrCode: qr?.code ?? null,
    };
  });
```

(Removes the separate `qrRecords` lookup and `log.qrCode.replace('QR:', '')`.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in these three files.

- [ ] **Step 5: Commit**

```bash
git add lib/badge-service.ts app/api/feed/route.ts app/api/customer/history/route.ts
git commit -m "fix: ScanLog readers use qrCodeId relation"
```

---

### Task 5: Fix Product.imageUrl consumers

**Files:**
- Modify: `app/api/qr/[code]/route.ts:114`
- Modify: `app/api/customer/history/route.ts` (handled in Task 4 — no extra change; `imageUrl` now from images)
- Modify: `app/api/admin/products/route.ts:91`
- Modify: `app/api/admin/products/[id]/route.ts:272-275`
- Modify: `app/api/admin/products/[id]/images/route.ts:142`
- Modify: `components/ProductCard.tsx:50-51`
- Modify: `components/ProductInfo.tsx:32`
- Modify: `components/CustomerHistoryList.tsx:68-70`
- Modify: `app/admin/products/page.tsx:356-358`
- Modify: `app/api/feed/route.ts:111` (feedPublic select)

**Interfaces:** Consumes: primary `ProductImage` via `product.images` relation.

- [ ] **Step 1: Replace each `product.imageUrl` read with primary image helper**

Define a shared helper (add to `lib/product-utils.ts` if not present):

```ts
export function primaryImageUrl(images?: { url: string; isPrimary?: boolean }[] | null): string | null {
  if (!images || images.length === 0) return null;
  return images.find((i) => i.isPrimary)?.url ?? images[0].url ?? null;
}
```

- [ ] **Step 2: Apply replacements**

`app/api/qr/[code]/route.ts:114`:
```ts
    const productImageUrl = primaryImageUrl(product.images);
```

`app/api/admin/products/route.ts:91`:
```ts
      imageUrl: primaryImageUrl(p.images),
```
(ensure the admin query includes `images: { select: { url: true, isPrimary: true } }` in its `include`).

`app/api/admin/products/[id]/route.ts:272-275` — when seeding first image from `product.imageUrl`, change to skip (image already comes from `images`). Replace:
```ts
  if (existingImages.length === 0 && product.imageUrl) {
    await tx.productImage.create({ data: { productId: product.id, url: product.imageUrl, altText: product.name, sortOrder: 0, isPrimary: true } });
  }
```
with:
```ts
  // primary image now lives in ProductImage; no fallback from removed product.imageUrl
```

`app/api/admin/products/[id]/images/route.ts:142` — remove the "also update product.imageUrl" comment/assignment block that sets `product.imageUrl`.

`components/ProductCard.tsx:50-51`:
```tsx
        {primaryImageUrl(product.images) ? (
          <img src={primaryImageUrl(product.images)!} alt={product.name} className="w-full h-full object-cover" />
```

`components/ProductInfo.tsx:32`:
```ts
    : primaryImageUrl(product.images) ? [{ id: '1', url: primaryImageUrl(product.images)!, isPrimary: true, sortOrder: 0, productId: product.id, createdAt: new Date().toISOString() }] : [];
```

`components/CustomerHistoryList.tsx:68-70`:
```tsx
              {item.product?.images ? (
                <img src={primaryImageUrl(item.product.images)!} ... />
```
(adjust to read `item.product.images`; if `item.product` lacks images in the API response, add `images` to the history route select in Task 4 — it already does).

`app/admin/products/page.tsx:356-358`:
```tsx
                    ) : primaryImageUrl(product.images) ? (
                        <img src={primaryImageUrl(product.images)!} ...
```

`app/api/feed/route.ts:111` (feedPublic select): remove `imageUrl: true` from the select; instead include `images: { where: { isPrimary: true }, take: 1, select: { url: true } }` and map `primaryImageUrl(p.images)`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no remaining references to `product.imageUrl`.

- [ ] **Step 4: Commit**

```bash
git add lib/product-utils.ts app/api/qr/\[code\]/route.ts app/api/admin/products/route.ts app/api/admin/products/\[id\]/route.ts app/api/admin/products/\[id\]/images/route.ts components/ProductCard.tsx components/ProductInfo.tsx components/CustomerHistoryList.tsx app/admin/products/page.tsx app/api/feed/route.ts
git commit -m "fix: replace Product.imageUrl with primary ProductImage"
```

---

### Task 6: Fix RoutineItem snapshot consumers

**Files:**
- Modify: `app/api/customer/routines/route.ts:68-70`
- Modify: `app/api/customer/routines/[id]/route.ts:62-64`

**Interfaces:**
- Consumes: `RoutineItem.product` relation (already exists) — read `product.name / product.brandName / product.images`.

- [ ] **Step 1: Include product relation in routines queries**

In both route files, where `routineItem` is selected/returned, replace:

```ts
        productName: item.productName,
        brandName: item.brandName ?? null,
        imageUrl: item.imageUrl ?? null,
```
with:
```ts
        productName: item.product?.name ?? '',
        brandName: item.product?.brandName ?? null,
        imageUrl: primaryImageUrl(item.product?.images) ?? null,
```
and ensure the `include` for `items` contains `product: { include: { images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true } } } }`.

Note: the `RoutineItem` input schema still accepts `productName/brandName/imageUrl` from the client for the *form* (that's fine — those are request fields, not persisted). Only the persistence + response read from `product`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/api/customer/routines/route.ts app/api/customer/routines/\[id\]/route.ts
git commit -m "fix: RoutineItem reads product via relation, drops snapshot fields"
```

---

### Task 7: Generate, build, verify, deploy

**Files:** none new (verification only).

- [ ] **Step 1: User runs the manual SQL**

Tell the user to paste `prisma/migrations/optimize_schema/supabase_manual.sql` into the Supabase SQL Editor and Run. This must happen BEFORE build/deploy consumes the new schema.

- [ ] **Step 2: Generate client + build**

Run: `npx prisma generate && npm run build`
Expected: build succeeds, no type errors.

- [ ] **Step 3: Verify DB state (via a quick check route or Supabase)**

Confirm via Supabase: `IngredientFlag`, `ExpiryAlert`, `ReviewHelpful` tables gone; `scan_logs` has `qrCodeId` not `qrCode`; `badges.criteriaJson` is jsonb.

- [ ] **Step 4: Deploy and smoke test**

Run: `npx vercel --prod --yes`
After deploy, with PowerShell:
```powershell
$base="https://urcheck.vercel.app"
Invoke-WebRequest "$base/" | Select-Object StatusCode          # 200
Invoke-WebRequest "$base/api/health" | Select-Object StatusCode # 200, db ok
```
Then scan a product (via `/api/qr/[code]` with a valid code) and confirm a `ScanLog` row is created with `qrCodeId` populated (check via Supabase or a history call).

- [ ] **Step 5: Commit any final tweaks and push**

```bash
git add -A
git commit -m "chore: post-optimization verification" || echo "nothing to commit"
git push origin main
```
