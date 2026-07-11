# Task 2: GET trên [id] + enrich share route

**Files to modify (copy verbatim từ plan):**

### 2.1 `app/api/customer/routines/[id]/route.ts`
File này ĐÃ có `PUT`/`DELETE` với `import { NextResponse } from 'next/server';` và signature `params: { params: Promise<{ id: string }> }`. Bạn PHẢI thêm `import { NextRequest, NextResponse }` (đổi dòng import đầu) và thêm hàm `mapRoutineItem` + export `GET` ở ĐẦU file (trước PUT).

Các import sau cần có (file gốc đã có `prisma`, `requireCustomerApi`, `z`, `primaryImageUrl`):
- Đổi dòng `import { NextResponse } from 'next/server';` thành `import { NextRequest, NextResponse } from 'next/server';`

Thêm hàm helper và GET (đặt ngay sau các import, trước PUT):

```typescript
function mapRoutineItem(item: any) {
  return {
    ...item,
    productName: item.product?.name ?? (item as any).productName ?? '',
    brandName: item.product?.brandName ?? null,
    imageUrl: primaryImageUrl(item.product?.images) ?? null,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await requireCustomerApi();
  if ('error' in guard) return guard.error;

  const routine = await prisma.routine.findFirst({
    where: { id, customerId: guard.session.customerId },
    include: {
      items: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true } } },
          },
        },
      },
    },
  });

  if (!routine) {
    return NextResponse.json({ success: false, message: 'Không tìm thấy routine' }, { status: 404 });
  }

  const mapped = { ...routine, items: routine.items.map(mapRoutineItem) };
  return NextResponse.json({ success: true, routine: mapped });
}
```

### 2.2 `app/api/routines/[shareToken]/route.ts`
Thay TOÀN BỘ nội dung file bằng code sau (giữ signature `NextRequest`, `params: Promise<{ shareToken: string }>`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { primaryImageUrl } from '@/lib/product-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;
  const routine = await prisma.routine.findFirst({
    where: { shareToken, isPublic: true },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1, select: { url: true } } },
          },
        },
      },
    },
  });

  if (!routine) {
    return NextResponse.json(
      { success: false, message: 'Không tìm thấy lịch trình' },
      { status: 404 }
    );
  }

  const items = routine.items.map((it: any) => ({
    id: it.id,
    productId: it.productId,
    timeOfDay: it.timeOfDay,
    order: it.order,
    notes: it.notes,
    productName: it.product?.name ?? '',
    brandName: it.product?.brandName ?? null,
    imageUrl: primaryImageUrl(it.product?.images),
  }));

  const { customerId, ...rest } = routine as Record<string, unknown>;
  void customerId;
  return NextResponse.json({
    success: true,
    routine: { ...rest, items },
  });
}
```

**Global Constraints:**
- Không đổi Prisma schema.
- `mapRoutineItem` map ra `productName/brandName/imageUrl` (dùng primaryImageUrl).
- Verify: `npx tsc --noEmit` (0 errors) + `npm run build` (pass).

**Commit:** `git add app/api/customer/routines/[id]/route.ts app/api/routines/[shareToken]/route.ts && git commit -m "feat: GET routine by id + enrich share route với product info"`

**Report:** `.superpowers/sdd/task-2-report.md` (status, commits, tsc/build result, concerns). Trả về status + commits + 1 dòng summary.
