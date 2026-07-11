## Tóm tắt
Hoan thien vong doi routine khach hang: tao (chon san pham that tu catalog), sua, xoa, xem chi tiet, chia se va clone routine cua nguoi khac.

## Thay doi chinh
- API search san pham cong khai /api/products/search
- GET /api/customer/routines/[id] + enrich share route voi product info
- ProductPicker component (debounce + dropdown)
- Tich hop picker vao RoutineForm + validate productId
- Sua bug edit: truyen onEdit vao RoutineList
- Trang chi tiet routine app/customer/routines/[id]/page.tsx
- Trang xem shared routine + clone app/routines/[shareToken]/page.tsx
- i18n keys vi/en + fix edit tu detail & bao loi clone

## Verification
- npx tsc --noEmit 0 errors; npm run build pass (72/72 pages)
- 8 task + fix wave deu qua review (READY TO MERGE)
