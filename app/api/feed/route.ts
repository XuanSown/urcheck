import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireCustomerApi } from '@/lib/customer-auth';
import { primaryImageUrl } from '@/lib/product-utils';

function encodeCursor(v: { s: number; i: string } | { t: string; i: string }): string {
  return Buffer.from(JSON.stringify(v)).toString('base64url');
}
function decodeCursor(raw: string | null): { s: number; i: string } | { t: string; i: string } | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(Buffer.from(raw, 'base64url').toString());
    if (typeof o.i === 'string' && (typeof o.s === 'number' || typeof o.t === 'string')) return o;
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const guard = await requireCustomerApi();
  const customerId = 'session' in guard ? guard.session?.customerId ?? null : null;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10) || 12));
  const cursor = decodeCursor(searchParams.get('cursor'));
  const skinTypeFilter = searchParams.get('skinType') || undefined;
  const brandFilter = searchParams.get('brand') || undefined;

  if (!customerId) return feedPublic(limit, skinTypeFilter, brandFilter, cursor as any);

  const [scanLogs, favorites] = await Promise.all([
    prisma.scanLog.findMany({ where: { customerId }, select: { qrCodeId: true }, take: 50, orderBy: { scannedAt: 'desc' } }),
    prisma.userFavorite.findMany({ where: { customerId }, include: { product: { select: { brandName: true, skinType: true } } } }),
  ]);
  const qrCodes = await prisma.qrCode.findMany({ where: { id: { in: scanLogs.map((s: any) => s.qrCodeId) } }, select: { id: true, code: true, productId: true } });
  const idToProductId = new Map(qrCodes.map((q: any) => [q.id, q.productId]));
  const scannedProductIds = new Set(scanLogs.map((s: any) => idToProductId.get(s.qrCodeId)).filter(Boolean));
  const favoriteIds = new Set(favorites.map((f: any) => f.productId));
  const favoriteBrands = new Set(favorites.map((f: any) => f.product?.brandName).filter(Boolean));
  const favoriteSkinTypes = new Set(favorites.map((f: any) => f.product?.skinType).filter((v: any) => typeof v === 'string'));

  const trending = await prisma.qrCode.findMany({ where: { isActive: true }, select: { productId: true, scanCount: true }, orderBy: { scanCount: 'desc' }, take: 30 });
  const trendingIds = trending.filter((t: any) => !scannedProductIds.has(t.productId)).map((t: any) => t.productId).slice(0, 10);

  const where: any = { status: 'PUBLISHED', id: { notIn: Array.from(scannedProductIds) } };
  if (skinTypeFilter) where.skinType = skinTypeFilter;
  else if (favoriteSkinTypes.size > 0) where.skinType = { in: Array.from(favoriteSkinTypes) };
  if (brandFilter) where.brandName = { contains: brandFilter, mode: 'insensitive' };
  else if (favoriteBrands.size > 0) where.brandName = { in: Array.from(favoriteBrands) };

  const candidates = await prisma.product.findMany({
    where,
    include: {
      qrCodes: { select: { scanCount: true } },
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      reviews: { select: { rating: true } },
    },
    take: 200,
  });

  const scored = candidates
    .map((p: any) => ({ ...p, _score: scoreProduct(p, favoriteSkinTypes, favoriteBrands, trendingIds) }))
    .sort((a: any, b: any) => (b._score - a._score) || (a.id < b.id ? -1 : 1));

  const startIdx = cursor && 's' in cursor ? scored.findIndex((p: any) => p._score === cursor.s && p.id === cursor.i) + 1 : 0;
  const slice = scored.slice(startIdx, startIdx + limit + 1);
  const hasMore = slice.length > limit;
  const pageItems = slice.slice(0, limit).map(({ _score, qrCodes, reviews, images, ...p }: any) => ({
    ...p,
    imageUrl: primaryImageUrl(images),
    verified: p.verified,
    rating: reviews.length ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) * 10) / 10 : null,
  }));

  return NextResponse.json({
    success: true,
    products: pageItems,
    nextCursor: hasMore ? encodeCursor({ s: slice[limit - 1]._score, i: slice[limit - 1].id }) : null,
    hasMore,
    profile: { skinType: Array.from(favoriteSkinTypes).slice(0, 3), brands: Array.from(favoriteBrands).slice(0, 5), scannedCount: scannedProductIds.size, savedCount: favoriteIds.size },
  });
}

function scoreProduct(product: any, skinTypes: Set<string>, brands: Set<string>, trendingIds: string[]) {
  let s = 0;
  if (skinTypes.size && product.skinType && skinTypes.has(product.skinType)) s += 3;
  if (brands.size && product.brandName && brands.has(product.brandName)) s += 2;
  if (trendingIds.includes(product.id)) s += 1;
  const scanCount = product.qrCodes?.reduce((sum: number, q: any) => sum + (q.scanCount ?? 0), 0) ?? 0;
  s += Math.min(scanCount, 100) / 100;
  return s;
}

async function feedPublic(limit: number, skinType?: string, brand?: string, cursor: any = null) {
  const where: any = { status: 'PUBLISHED' };
  if (skinType) where.skinType = skinType;
  if (brand) where.brandName = { contains: brand, mode: 'insensitive' };

  const candidates = await prisma.product.findMany({
    where,
    include: { images: { where: { isPrimary: true }, take: 1, select: { url: true } }, reviews: { select: { rating: true } } },
    take: 200,
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
  });
  const startIdx = cursor && 't' in cursor ? candidates.findIndex((p: any) => p.createdAt.toISOString() === cursor.t && p.id === cursor.i) + 1 : 0;
  const slice = candidates.slice(startIdx, startIdx + limit + 1);
  const hasMore = slice.length > limit;
  const pageItems = slice.slice(0, limit).map(({ reviews, images, ...p }: any) => ({
    ...p,
    imageUrl: primaryImageUrl(images),
    verified: p.verified,
    rating: reviews.length ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) * 10) / 10 : null,
  }));
  return NextResponse.json({
    success: true,
    products: pageItems,
    nextCursor: hasMore ? encodeCursor({ t: slice[limit - 1].createdAt.toISOString(), i: slice[limit - 1].id }) : null,
    hasMore,
    profile: { skinType: [], brands: [], scannedCount: 0, savedCount: 0 },
  });
}
