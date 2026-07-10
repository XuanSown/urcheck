import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireCustomerApi } from '@/lib/customer-auth';
import { primaryImageUrl } from '@/lib/product-utils';

export async function POST(request: Request) {
  const guard = await requireCustomerApi();
  if ('error' in guard) return guard.error;
  const customerId = guard.session.customerId;
  const { productId } = await request.json().catch(() => ({ productId: undefined }));
  if (!productId || typeof productId !== 'string') {
    return NextResponse.json({ success: false, error: 'Thiếu productId' }, { status: 400 });
  }
  const existing = await prisma.userFavorite.findUnique({ where: { customerId_productId: { customerId, productId } } });
  if (existing) {
    await prisma.userFavorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, favorited: false });
  }
  await prisma.userFavorite.create({ data: { customerId, productId } });
  return NextResponse.json({ success: true, favorited: true });
}

export async function GET() {
  const guard = await requireCustomerApi();
  if ('error' in guard) return NextResponse.json({ success: false, auth: true });
  const customerId = guard.session.customerId;
  const favs = await prisma.userFavorite.findMany({
    where: { customerId },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = favs.map((f: any) => {
    const { reviews, images, ...p } = f.product;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rating = reviews.length ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) * 10) / 10 : null;
    return { ...p, imageUrl: primaryImageUrl(images), verified: p.verified, rating };
  });
  return NextResponse.json({ success: true, products });
}
