# Fix wave report

## Status
DONE

## Commits
- `0d67936` — fix: xử lý edit từ detail + báo lỗi clone routine

## Changes
- **Fix A**: `app/customer/routines/page.tsx` — đọc `?edit=` qua `useSearchParams`, auto mở form edit. Bọc `CustomerRoutinesContent` trong `<Suspense>` (Next 16 yêu cầu).
- **Fix B**: `app/routines/[shareToken]/page.tsx` — `handleClone` bắt branch `!data.success` → alert lỗi.
- `lib/i18n.ts` — thêm key `routines_clone_failed` (vi + en).

## Verification
- `npx tsc --noEmit` → 0 errors
- `npm run build` → pass (BUILD_EXIT=0)
