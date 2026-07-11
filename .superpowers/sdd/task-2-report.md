# Task 2 Report: GET routine by id + enrich share route

## Status
✅ COMPLETED

## Commits
- `e3daf59` feat: GET routine by id + enrich share route với product info

## Changes
### `app/api/customer/routines/[id]/route.ts`
- Đổi import đầu thành `import { NextRequest, NextResponse } from 'next/server';`
- Thêm helper `mapRoutineItem` (đã có sẵn trong file) và export `GET` ở ĐẦU file (trước PUT).
- Giữ nguyên PUT/DELETE.

### `app/api/routines/[shareToken]/route.ts`
- Thay TOÀN BỘ nội dung: enrich items với `productName`/`brandName`/`imageUrl` qua `primaryImageUrl`, bỏ `customerId` khỏi response.

## Verification
- `npx tsc --noEmit` → 0 errors
- `npm run build` → pass (Next.js 16.2.10, Turbopack)

## Concerns
- Không có. Cấu trúc file hiện tại khớp với brief, áp dụng verbatim không phát sinh vấn đề.
