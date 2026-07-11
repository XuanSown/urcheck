# Review Package - Task 1 (customer routines)

## Commits (dd52625..HEAD)
50d7db5 feat: API search sản phẩm cho routine picker

## Diff stat
 app/api/products/search/route.ts | 39 +++++++++++++++++++++++++++++++++++++++  1 file changed, 39 insertions(+)

## Full diff
``ndiff --git a/app/api/products/search/route.ts b/app/api/products/search/route.ts new file mode 100644 index 0000000..c089275 --- /dev/null +++ b/app/api/products/search/route.ts @@ -0,0 +1,39 @@ +import { NextRequest, NextResponse } from 'next/server'; +import prisma from '@/lib/db'; +import { primaryImageUrl } from '@/lib/product-utils'; + +export async function GET(request: NextRequest) { +  const { searchParams } = new URL(request.url); +  const q = (searchParams.get('q') || '').trim(); +  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20)); + +  if (!q) { +    return NextResponse.json({ success: true, products: [] }); +  } + +  const products = await prisma.product.findMany({ +    where: { +      status: 'PUBLISHED', +      OR: [ +        { name: { contains: q, mode: 'insensitive' } }, +        { brandName: { contains: q, mode: 'insensitive' } }, +      ], +    }, +    take: limit, +    select: { +      id: true, +      name: true, +      brandName: true, +      images: { where: { isPrimary: true }, take: 1, select: { url: true } }, +    }, +  }); + +  const mapped = products.map((p) => ({ +    id: p.id, +    name: p.name, +    brandName: p.brandName, +    imageUrl: primaryImageUrl(p.images), +  })); + +  return NextResponse.json({ success: true, products: mapped }); +}
``n
