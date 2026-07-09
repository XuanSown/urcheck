# Task 4 Report — ScanLog read paths use qrCodeId relation

## Status
COMPLETED

## Commit
`710c12c67c2d049d84a5cfabb5a0c08b1d4ebc38` — "fix: ScanLog readers use qrCodeId relation"

## Files changed
- `lib/badge-service.ts` — scanLogs query now selects `qrCodeId`; joins `qrCode` by id, derives brands from `qrRecords.product.brandName`. Dropped dead `productByCode`/`codeSet` and the `l.qrCode!.replace('QR:', '')` parsing (no consumer loop existed in the file).
- `app/api/feed/route.ts` — scanLogs select `qrCodeId: true`; builds `idToProductId` map (`q.id -> q.productId`) and `scannedProductIds` from `idToProductId.get(s.qrCodeId)`.
- `app/api/customer/history/route.ts` — scanLogs query `include`s the `qrCode` relation with nested `product` (incl. `images: { where:{isPrimary:true}, take:1, select:{url:true} }`); builds items from `log.qrCode?.product`, `imageUrl = product?.images?.[0]?.url ?? null`, `qrCode: log.qrCode?.code ?? null`. Removed separate `qrRecords` lookup and `log.qrCode.replace('QR:', '')`.

## tsc summary
`npx tsc --noEmit` after edits:
- No ScanLog-related errors in the three files.
- Remaining (non-Task-4, expected) errors:
  - `app/api/feed/route.ts:111` — `imageUrl` select in `feedPublic`; owned by **Task 5**.
  - `app/api/admin/products/route.ts:91` — `product.imageUrl`; owned by **Task 5**.
- Also applied a minimal fix in `lib/badge-service.ts:54` (`JSON.parse(JSON.stringify(badge.criteriaJson))`) because Task 1 changed `criteriaJson` to `Json`, which surfaced as a `JsonValue` not assignable to `string` error in this file. This is unrelated to ScanLog but was blocking this file from being clean.

## Concerns
- The plan's Task 4 replacement for `lib/badge-service.ts` declared `productByCode` and `codeSet`, but the actual file has no downstream loop consuming them (the original code already built `brands` via `productByCode.get(...)`). I dropped the dead declarations to avoid unused locals, since the code now derives `brands` directly from `qrRecords`. Behavior is preserved (brands set = unique brandNames across scanned qrCodes).
- The `criteriaJson` fix is a side effect of Task 1's schema change reaching this file; flagged in case the owner wants a different approach, but it is required for this file to typecheck cleanly.
- Grep for `\.qrCode\b` across the three files now only matches `prisma.qrCode` model calls and the `log.qrCode` relation (the new correct usage) — no references to the old `ScanLog.qrCode` String column remain.

---

## Task 4 Review — SPEC + QUALITY (reviewer)

### (1) Spec review: ✅ PASS
All global constraints and behavioral requirements verified against the diff + full files:

- **No `ScanLog.qrCode` String / `.replace('QR:', '')` remains.** Grep for `qrCode!.replace|qrCode.startsWith|scanLog.qrCode|qrCode: true` across `*.ts` → no matches. The only `.qrCode` usages are `prisma.qrCode` model calls and the new `log.qrCode` relation (correct).
- **badge-service** uses `qrCodeId` + `qrCode` relation (`where: { id: { in: qrIds } }`) to get `product.brandName`. `totalScans` (= scanLogs.length), `brands` (unique brandName set), `uniqueDays` all preserved. Behavior identical to before.
- **feed** selects `qrCodeId: true`; builds `idToProductId` (`q.id -> q.productId`) and `scannedProductIds` from `idToProductId.get(s.qrCodeId)`. Mapping qrCodeId → productId is correct.
- **history** `include`s `qrCode -> product` with `images: { where:{isPrimary:true}, take:1, select:{url:true} }`; returns `imageUrl = product?.images?.[0]?.url ?? null` and `qrCode: qr?.code ?? null`. Shape preserved (id, name, brandName, imageUrl, verified, expiryDate, qrCode).
- **Null handling:** all new access uses optional chaining (`qr?.product`, `product?.images?.[0]?.url ?? null`, `qr?.code ?? null`). No new runtime null bugs.
- Remaining `imageUrl` tsc errors are in `feedPublic` (`feed/route.ts:111`) and `admin/products` — correctly owned by Task 5, not flagged as Task 4 defects.

### (2) Code quality: Approved (with Minor notes)

**Critical:** none.
**Important:** none.

**Minor:**
- `badge-service.ts:35` — `select: { code: true, product: ... }`. After dropping `productByCode`/`codeSet`, `code` is no longer read anywhere. Harmless dead field in the select; can be removed for clarity (no behavior change).
- `app/api/feed/route.ts:21` and `:33` — `scanLogs.map((s: any) => s.qrCodeId)` and related maps still use `any` typing. Pre-existing style, not introduced by Task 4; not a regression.

### criteriaJson change — confirmed safe, not a breaking scope creep
`badge-service.ts:54` changed `JSON.parse(badge.criteriaJson)` → `JSON.parse(JSON.stringify(badge.criteriaJson))`.

- Root cause: Task 1 changed `Badge.criteriaJson` to `Json` (Prisma `JsonValue`), so the old `JSON.parse(<JsonValue>)` no longer typechecks and would *also* throw at runtime when given a parsed object (not a string). This change is a required consequence of Task 1 reaching this file.
- Safety: `JSON.stringify` normalizes any JsonValue (object/array/string) to a string, then `JSON.parse` restores the same shape. Semantically a deep-clone/normalize with **no behavior change** to `criteria` (`{ type, min }`). It is in fact *more* correct than reverting (the original would now throw + skip the badge on real jsonb objects, since Task 2's migration casts via `::jsonb`).
- Scope: non-Task-4 touching, but necessary for this file to typecheck and for badges to evaluate correctly. Acceptable. Recommended to keep; if the owner prefers, the cleaner alternative is typing `badge.criteriaJson as Criteria` directly (since Json already returns the parsed object), but the current code is safe and equivalent.
