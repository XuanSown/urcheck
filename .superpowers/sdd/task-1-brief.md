# Task 1: API tìm kiếm sản phẩm

**File:** Create `app/api/products/search/route.ts`

**Yêu cầu (copy verbatim từ plan):**

Tạo route Server (không yêu cầu auth). `GET /api/products/search?q=<text>&limit=20`.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { primaryImageUrl } from '@/lib/product-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));

  if (!q) {
    return NextResponse.json({ success: true, products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { brandName: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: limit,
    select: {
      id: true,
      name: true,
      brandName: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
    },
  });

  const mapped = products.map((p) => ({
    id: p.id,
    name: p.name,
    brandName: p.brandName,
    imageUrl: primaryImageUrl(p.images),
  }));

  return NextResponse.json({ success: true, products: mapped });
}
```

**Global Constraints (binds this task):**
- Không thay đổi Prisma schema.
- i18n: copy `t('routines_*')` — task này không cần i18n.
- Verify: `npx tsc --noEmit` (0 errors) + `npm run build` (pass).
- Dùng `@/lib/db` (prisma) và `@/lib/product-utils` (primaryImageUrl) — đã tồn tại.

**Commit:** `git add app/api/products/search/route.ts && git commit -m "feat: API search sản phẩm cho routine picker"`

**Report contract:** viết báo cáo vào `.superpowers/sdd/task-1-report.md` với: status (DONE/BLOCKED/...), commits, tsc/build result, concerns. Trả về chỉ status + commits + 1 dòng test summary.
