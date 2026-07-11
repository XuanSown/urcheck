# Task 6 Report: Trang chi tiết routine `[id]`

## Status
DONE

## Commits
- `238ae9c` feat: trang chi tiết routine + link từ list

## Summary
Tạo trang detail routine (`/customer/routines/[id]`) với auth guard, fetch GET by id, group theo buổi qua `lib/routine-utils`, nút sửa/xoá/chia sẻ; bọc tiêu đề trong `RoutineList` bằng link đến detail. `tsc --noEmit` 0 errors, `npm run build` pass.
