# Task 6 Report — RoutineItem reads product via relation, drops snapshot fields

## Status
DONE

## Commit
`a2989c9` — fix: RoutineItem reads product via relation, drops snapshot fields

## Files changed
- `app/api/customer/routines/route.ts`
- `app/api/customer/routines/[id]/route.ts`

## Changes
- A) Removed `productName`/`brandName`/`imageUrl` from `items.create` maps in both files (persist only `productId`, `timeOfDay`, `order`, `notes`).
- B) Added `product` relation (with primary image) to all `include` blocks: list `findMany`, POST create response, PUT update response.
- C) Added `mapRoutineItem` helper in both files exposing `productName`/`brandName`/`imageUrl` derived from the `product` relation, so client contract unchanged. Responses mapped before returning.
- Zod `routineItemSchema` left unchanged (still accepts request-only fields).

## tsc summary
`npx tsc --noEmit` — clean, no errors.

## Grep check
`item.productName` / `item.imageUrl` — no occurrences in create data. Only appear in Zod schema and `mapRoutineItem` fallback.

## Concerns
- Response now depends on `product` relation existing; if a `RoutineItem.productId` points to a deleted/missing Product, `item.product` is null and `productName` falls back to `''`, `imageUrl`/`brandName` to null (graceful, but consider whether orphan items should error).
- The `product` `images` query uses `where: { isPrimary: true }, take: 1` — matches Task 5 `primaryImageUrl` logic but only the primary image is fetched; consistent.
- `mapRoutineItem` uses `any`; acceptable for response shaping but could be tightened with a type if RoutineItem shape changes.

---

## Reviewer SPEC + Quality Review (Task 6)

### (1) Spec Verification — ✅ PASS
- [x] **items.create no longer writes snapshot fields** — both `POST` (route.ts:78-83) and `PUT` (route.ts:70-75) create only `productId`, `timeOfDay`, `order`, `notes`. No `productName`/`brandName`/`imageUrl` persisted. ✅
- [x] **All `include` blocks include `product` relation** — GET list (route.ts:45), POST response (route.ts:89), PUT response (route.ts:85) all `include: { product: { include: { images: { where: { isPrimary: true }, take: 1, select: { url, isPrimary } } } } }`. ✅
- [x] **Responses expose productName/brandName/imageUrl derived from product** — `mapRoutineItem` (both files:7-14) maps `item.product?.name/brandName` + `primaryImageUrl(item.product?.images)`. ✅
- [x] **Zod schema still accepts client fields request-only** — `routineItemSchema`/`routineUpdateSchema` unchanged, still accept `productName`/`brandName`/`imageUrl`. ✅
- [x] **tsc clean** — `npx tsc --noEmit` produced no errors. ✅
- [x] **Behavior preserved** — routines still return items with name/brand/image via `product` relation; global constraint honored (no snapshot columns persisted). ✅

No spec gaps.

### (2) Code Quality — Approved (minor only)
- **Critical:** none.
- **Important:** none.
- **Minor:**
  - `mapRoutineItem` typed as `any` in both files; acceptable for response shaping but a typed helper (or shared module) would be cleaner and avoids duplication across the two routes.
  - Dead fallback: `?? (item as any).productName ?? ''` — since snapshot fields are never persisted, `item.productName` is always `undefined`; the fallback is dead code. Harmless but misleading. Could simplify to `item.product?.name ?? ''`.
  - Helper `mapRoutineItem` is duplicated verbatim in both route files; a shared `lib/routine-utils.ts` would reduce drift risk.

**Verdict:** Approved. Ship. The minor items are optional cleanups, not blockers.
