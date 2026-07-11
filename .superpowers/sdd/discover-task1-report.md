# Discover V2 — Task 1 Report

## What was done
Replaced the entire contents of `app/api/feed/route.ts` to convert the feed
endpoint from offset pagination (`page`/`limit`) to cursor pagination
(`cursor` + `limit`) for infinite scroll, while preserving the existing
ranking score logic.

Key changes:
- Added `encodeCursor` / `decodeCursor` helpers (base64url of `{ s, i }` for
  logged-in users, `{ t, i }` for public feed).
- Logged-in path: scores candidates, sorts by `_score` then `id`, slices by
  cursor position into pages, returns `nextCursor` + `hasMore`.
- Public path (`feedPublic`): cursors by `createdAt` + `id` using
  `orderBy: [{ createdAt: 'desc' }, { id: 'asc' }]`.
- Both paths now include `verified` and computed `rating` fields on each
  product item, and return `profile.savedCount`.
- Removed the old `pagination` object (`page`/`limit`/`total`).

## Verification
- `npx tsc --noEmit` : **0 errors** (exit code 0).
- `npm run lint` : **0 errors in `app/api/feed/route.ts`**. (The repo has
  pre-existing lint errors/warnings in other files unrelated to this change.)

## Commit
- SHA: `060ed747b1d3c0545a415b9aec3e857268f8b2dc`
- Subject: `feat(api): feed cursor pagination (score,id) + verified/rating fields`

---

## Follow-up fix (reviewer findings)

Three changes applied to `app/api/feed/route.ts`:

1. **Guard missing-cursor-item reset (Important 1).** Both the logged-in path
   (`scored.findIndex(...)`) and the public path (`candidates.findIndex(...)`)
   now check for `findIndex === -1` and clamp `startIdx` to `0` instead of
   producing `-1 + 1 = 0` plus a potential crash on undefined cursor object.
   This avoids re-sending from an invalid index; a full restart is the safe
   fallback when the cursor item left the result set between requests.
2. **Remove `take: 200` cap (Important 2).** Removed the `take: 200` from both
   `prisma.product.findMany` calls (logged-in and `feedPublic`) so cursor
   pagination can traverse the entire PUBLISHED catalog (small dataset).
3. **Extract `avgRating` helper.** Added `avgRating(reviews)` and replaced the
   inline reduce in both map() callbacks to prevent drift.

### Verification
- `npx tsc --noEmit` : **0 errors**.
- `npm run lint` : **0 NEW errors in `app/api/feed/route.ts`**. Pre-existing
  `any`-related errors in this file and repo-wide are unchanged (the
  `cursor as any` is permitted per instructions).

### Commit
- SHA: `31469f9`
- Subject: `fix(api): guard missing cursor item, remove 200-cap, extract avgRating`
