# Discover Task 4 — ProductCard Beautification

## Status
Done

## Commit
SHA: `2fd2a7e184672ae666941c3cb045bafd2a1da96a`
Subject: `feat(ui): beautify ProductCard with verified badge + rating + hover`

## Summary of changes (`components/ProductCard.tsx`)
1. Added `verified?: boolean;` and `rating?: number | null;` to the `Product` type.
2. Imported `useReducedMotion` from `framer-motion` (added to imports).
3. Added `const reduced = useReducedMotion();` after `useCustomerAuth()`.
4. Root div now uses `group` + `transition-all duration-200` and conditionally applies `hover:-translate-y-1 hover:shadow-lg` only when motion is allowed.
5. After the `skinType` badge, added the verified badge (emerald check) and a 5-star rating block using `discover_verified` / `discover_rating` i18n keys.
6. Existing behavior preserved: wishlist POST `/api/customer/wishlist`, Quét link to `/?q=product.id`.

## Verification
- `npx tsc --noEmit`: 0 errors.
- `npm run lint`: 0 new errors in `components/ProductCard.tsx`. The file has 1 pre-existing warning (`@next/next/no-img-element` on the existing `<img>`), which is unrelated to these changes. The repo has 127 pre-existing lint errors elsewhere — none introduced by this task.
