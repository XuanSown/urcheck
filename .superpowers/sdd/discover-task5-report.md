# Discover v2 — Task 5 Report

## Task
Beautify `components/FilterBar.tsx` for discover v2: make it sticky with a blurred
backdrop, wrap in a framer-motion entrance animation, and render removable chip
pills for any active filter (skinType or brand) with an x button, plus a "Clear
filters" button when any filter is active. Keep the exact same props and behavior.
Use `useReducedMotion` so animation is disabled when reduced-motion is preferred.

## Implementation
Replaced the full contents of `components/FilterBar.tsx` per the provided spec:
- `'use client'` component retained.
- Added `motion` + `useReducedMotion` from `framer-motion`.
- Root wrapped in `motion.div` with `sticky top-0 z-10` + `backdrop-blur` and
  white/dark translucent background and bottom border.
- Entrance animation respects reduced motion (`opacity` only, `duration: 0` when reduced).
- Active `skinType` / `brand` render removable chip pills with `✕` buttons that call
  `onSkinTypeChange(undefined)` / `onBrandChange(undefined)`.
- "Clear filters" button uses `t('filter_clear')` and shows only when a filter is active.
- Same props and onChange/reset behavior preserved.

## Verification
- `npx tsc --noEmit`: 0 errors in the project.
- `npm run lint`: no errors or warnings in `components/FilterBar.tsx` (pre-existing
  lint issues elsewhere in the repo are unrelated to this change).

## Commit
`c6253bf` — feat(ui): sticky animated FilterBar with removable chips
