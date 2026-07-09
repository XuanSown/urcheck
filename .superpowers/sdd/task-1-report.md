# Task 1 Report — Prisma Schema Prune + Normalize

## Status
DONE

## Commit
bca0c553eff8d6b8aab3da55e5696abae32e5e31

(`schema: prune unused tables, denormalize fields, normalize FK/types`)

## Changes applied (prisma/schema.prisma)
- Deleted models: `IngredientFlag`, `ExpiryAlert`, `ReviewHelpful` (entire blocks).
- Also removed now-dangling relation fields that referenced those deleted models:
  - `Product.expiryAlerts`
  - `CustomerAccount.expiryAlerts`, `CustomerAccount.helpful`
  - `ProductReview.helpful`
- `Product`: removed `imageUrl String?`.
- `ProductVersion`: removed `imageSnapshot Json?`.
- `RoutineItem`: removed `productName String`, `brandName String?`, `imageUrl String?`.
- `Badge`: `criteriaJson String` → `criteriaJson Json`.
- `ScanLog`: replaced `qrCode String` with `qrCodeId String` + `qrCode QrCode @relation(... onDelete: Cascade)`; indexes → `[@@index([qrCodeId]), @@index([scannedAt]), @@index([customerId]), @@index([deviceId])]`; kept `@@map("scan_logs")`.
- `QrCode`: removed `@@index([scanCount])` (column retained); added inverse `scanLogs ScanLog[]` so the new relation validates.

## `npx prisma generate`
Succeeded (Prisma Client v5.22.0). One validation error was hit mid-edit (missing inverse relation on `QrCode`) and resolved before generating.

## `npx tsc --noEmit` — observed errors (EXPECTED; fixed in Tasks 3–6)
| File | Lines | Cause |
|------|-------|-------|
| app/api/admin/products/[id]/images/route.ts | 146, 228, 233 | `product.imageUrl` removed |
| app/api/admin/products/[id]/versions/route.ts | 34 | `productVersion.imageSnapshot` removed |
| app/api/admin/products/route.ts | 91 | `product.imageUrl` removed |
| app/api/customer/history/route.ts | 27, 45, 55, 57, 58, 60, 70, 72, 73, 74, 75, 76, 77, 78 | `scanLog.qrCode` removed / `qrCode.product` relation / `product.imageUrl` |
| app/api/feed/route.ts | 111 | `product.imageUrl` removed |
| app/api/qr/[code]/route.ts | 39, 68, 105, 110 | `product.imageUrl` / `qrCode.product` / `scanLog.qrCode` (write) |
| lib/badge-service.ts | 31, 43, 57 | `scanLog.qrCode.replace(...)` / `criteriaJson` now Json |

## One-line test summary
`prisma generate` passes; `tsc` shows 30+ expected errors across 8 files referencing removed fields/relations (to be fixed in Tasks 3–6).

---

## Reviewer Sign-off (Spec Compliance + Code Quality)

### Verdict 1 — Spec Compliance: ✅
All Task 1 requirements verified against `git diff a8f66fc bca0c55 -- prisma/schema.prisma` and the live `prisma/schema.prisma`:

- ✅ Models `IngredientFlag`, `ExpiryAlert`, `ReviewHelpful` fully deleted (entire blocks).
- ✅ `Product.imageUrl` removed (line 32 area; `expiryAlerts` relation also dropped).
- ✅ `ProductVersion.imageSnapshot` removed.
- ✅ `RoutineItem.productName` / `brandName` / `imageUrl` removed.
- ✅ `Badge.criteriaJson` is now `Json` (line 115).
- ✅ `ScanLog` has `qrCodeId String` + `qrCode QrCode @relation(..., onDelete: Cascade)`; indexes on `qrCodeId`, `scannedAt`, `customerId`, `deviceId`; `@@map("scan_logs")` retained.
- ✅ `QrCode` no longer has `@@index([scanCount])` (column retained); inverse `scanLogs ScanLog[]` added (line 150).
- ✅ Dangling relations to deleted models removed: `Product.expiryAlerts`, `CustomerAccount.expiryAlerts` + `helpful`, `ProductReview.helpful`.
- ✅ No `.ts` files changed.
- ✅ `prisma generate` succeeded; tsc errors are expected and out of scope.

No gaps found.

### Verdict 2 — Code Quality: Approved
No Critical or Important findings. The schema is internally consistent: every relation has its required inverse, the FK `onDelete: Cascade` matches the plan, snake_case `@@map` names are preserved, and PascalCase model names are kept.

Minor observations (non-blocking, informational):
- The report's "Concerns" section accurately notes the inverse `QrCode.scanLogs` field was required for validation — this is correct and expected, not a defect.
- `ScanLog.qrCodeId` has no `@default`, so the manual SQL (Task 2) must supply a non-null value for existing rows; this is consistent with the plan's `ADD COLUMN ... NOT NULL DEFAULT ''` followed by backfilling. Task 2 owns this. Tracked, not a Task-1 defect.

No action required for Task 1.

---

## Concerns
- The plan's Task 1 edits were necessary but **incomplete on their own** to make `prisma generate` pass: deleting `ExpiryAlert`/`ReviewHelpful` left dangling relations on `Product`, `CustomerAccount`, `ProductReview`, and the new `ScanLog.qrCode` relation required an inverse `QrCode.scanLogs` field. I added these to satisfy schema validation. This does not change feature behavior and matches the intended target schema.
- No `.ts` files were modified. DB commands were not run (P1001, per constraints).
- `lib/badge-service.ts(57)` error (`criteriaJson` is now `Json` not `string`) is a downstream type change from the `Badge.criteriaJson` normalization — will need handling in later tasks.
