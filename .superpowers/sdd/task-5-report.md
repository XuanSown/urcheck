# Task 5 Report — Replace Product.imageUrl with primary ProductImage

## Status
DONE

## Commit
`c469bd9` — "fix: replace Product.imageUrl with primary ProductImage"

## tsc summary
`npx tsc --noEmit` passes clean (no errors). Grep for `\.imageUrl\b` returns no matches — no `product.imageUrl` references remain.

## Files changed
- `lib/product-utils.ts` (new) — `primaryImageUrl` helper.
- `app/api/qr/[code]/route.ts` — uses `primaryImageUrl(product.images)`; removed `imageUrl: true` from product select.
- `app/api/admin/products/route.ts` — `imageUrl: primaryImageUrl(p.images)`; import added.
- `app/api/admin/products/[id]/route.ts` — `formatProductResponse` no longer synthesizes legacy image from `product.imageUrl`.
- `app/api/admin/products/[id]/images/route.ts` — removed product.imageUrl update on create AND on delete (both branches), since primary image lives only in ProductImage.
- `app/api/admin/products/[id]/versions/route.ts` — dropped `imageSnapshot` (field removed in Task 1) to keep tsc clean.
- `app/api/customer/history/route.ts` — returns `images` on product (Task 4 already selected it).
- `app/api/feed/route.ts` — feedPublic selects `images` and maps `imageUrl: primaryImageUrl(p.images)`; removed `imageUrl: true`.
- `components/ProductCard.tsx` — uses `primaryImageUrl(product.images)`; added `images` to prop type.
- `components/ProductInfo.tsx` — uses `primaryImageUrl(product.images)`.
- `components/CustomerHistoryList.tsx` — uses `primaryImageUrl(item.product?.images)`; added `images` to product type; import added.
- `app/admin/products/page.tsx` — uses `primaryImageUrl(product.images)`.

## Concerns
- Additional `product.imageUrl` writes existed in `[id]/images/route.ts` (delete handler) and `imageSnapshot` reads in `[id]/versions/route.ts`, not listed in the task — both fixed to keep tsc clean. These were collateral of Task 1's schema removal.
- `Product.imageUrl` is still present in the `types/product.ts` `Product` interface and the discover page `Product` type (as optional, unused). Left in place to avoid wider churn; harmless since tsc has no `.imageUrl` reads now. Can be cleaned up later.
- Behind-the-scenes: the SQL dropping Product.imageUrl must be applied (Task 2) before deploy; code now assumes the column is gone.

---

## Reviewer SPEC + QUALITY Review (Task 5)

### (1) Spec — ✅ PASS

All checklist items satisfied:
- `lib/product-utils.ts` created with `primaryImageUrl` helper (matches plan signature). ✅
- No `product.imageUrl` reads remain. Grep of `*.{ts,tsx}` for `product\.imageUrl` / `imageUrl: true` / `\.imageUrl\b` returns only: 2 comments in admin routes (intentional), and 2 reads in `routines/route.ts` + `routines/[id]/route.ts` — both are **Task 6 scope** (RoutineItem.imageUrl, owner of that task), correctly NOT flagged here. ✅
- Image upload update block removed in `[id]/images/route.ts` (POST `isPrimary` update + DELETE fallback reorder block both gone). ✅
- Legacy fallback block removed in `[id]/route.ts` `formatProductResponse`. ✅
- history API returns `images` (Task 4 change present in this diff: line added `images: product.images`, and the select already filters `where: { isPrimary: true }, take: 1`). ✅
- tsc clean (verified: `npx tsc --noEmit` exit 0). ✅

Consumers covered: qr route, admin products routes (GET + formatProductResponse), ProductCard, ProductInfo, CustomerHistoryList, admin page, feedPublic — all use `primaryImageUrl(product.images)` or the `images` relation. Behavior preserved: products still display a primary image.

### (2) Code Quality — Approved (with Minor notes)

No Critical / Important issues.

**Minor**
- In `ProductCard.tsx`, `app/admin/products/page.tsx`, `CustomerHistoryList.tsx` and `ProductInfo.tsx`, `primaryImageUrl(...)` is invoked twice per render (once for the guard, once for `src={...!}`). Harmless; could cache in a local `const` for readability but not required.
- `Product.imageUrl` left as an optional unused field in `types/product.ts` and the discover page type (report concern noted). Harmless since no read paths remain; cleanup is optional tech-debt.
- `ProductInfo.tsx` still synthesizes a fake `{ id: '1', ... }` image object when `primaryImageUrl(product.images)` is truthy but `product.images` is empty — that branch is now effectively unreachable (it falls to `[]` when no images). Harmless dead-ish branch.

**Extra changes (implementer) — safe & in-scope**
- Delete handler in `[id]/images/route.ts` dropping the `product.imageUrl` fallback reorder: safe. Primary image is now solely `ProductImage`; the removed DB writes would fail post-Task-1 SQL anyway. Correct.
- `imageSnapshot` removed from `[id]/versions/route.ts`: correct — field dropped in Task 1, keeping it would break tsc. In-scope collateral.
- No version route logic/behavior changed beyond the field drop.

Conclusion: Task 5 meets spec and quality bar. Ship after Task 2 SQL is applied (global constraint).
