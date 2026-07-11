# Task 5: Sửa bug Edit ở page chính

**File to modify:** `app/customer/routines/page.tsx` (đọc trước khi sửa)

Bug: `<RoutineList>` được gọi KHÔNG truyền `onEdit`, nên nút Sửa không render và không sửa được. `<RoutineList>` (components/RoutineList.tsx) ĐÃ hỗ trợ prop `onEdit?: (routine: any) => void` — chỉ cần truyền vào.

**Thay đổi:** Tìm block:
```tsx
        ) : (
          <RoutineList routines={routines} onChanged={fetchRoutines} />
        )}
```
và thay thành:
```tsx
        ) : (
          <RoutineList
            routines={routines}
            onChanged={fetchRoutines}
            onEdit={(r) => {
              setEditing(r);
              setShowForm(true);
            }}
          />
        )}
```

(`setEditing` và `setShowForm` đã có trong component page này — thấy ở state khai báo.)

**Global Constraints:**
- Chỉ sửa block đó. Không đổi logic khác.
- Verify: `npx tsc --noEmit` + `npm run build` pass.

**Commit:** `git add app/customer/routines/page.tsx && git commit -m "fix: truyền onEdit vào RoutineList (sửa bug edit routine)"`

**Report:** `.superpowers/sdd/task-5-report.md`. Trả status + commits + 1 dòng summary.
