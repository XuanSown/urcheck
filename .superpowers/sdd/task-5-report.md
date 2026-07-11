# Task 5 Report: Sửa bug Edit ở page chính

**Status:** DONE

**Commits:**
- `84cd36d5b1913ca5ec4e8571f52f17fe6fb79de5` — fix: truyền onEdit vào RoutineList (sửa bug edit routine)

**Summary:**
Thay block `<RoutineList routines={routines} onChanged={fetchRoutines} />` bằng version truyền `onEdit` mở form sửa (setEditing + setShowForm), verify `tsc --noEmit` 0 errors và `npm run build` pass.
