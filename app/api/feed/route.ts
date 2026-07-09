import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireCustomerApi } from '@/lib/customer-auth';

export async function GET(request: Request) {
  const guard = await requireCustomerApi();
  const customerId = 'session' in guard ? guard.session?.customerId ?? null : null;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10) || 12));
  const skinTypeFilter = searchParams.get('skinType') || undefined;
  const brandFilter = searchParams.get('brand') || undefined;

  if (!customerId) {
    return feedPublic(limit, skinTypeFilter, brandFilter);
  }

  const [scanLogs, favorites] = await Promise.all([
    prisma.scanLog.findMany({
      where: { customerId },
      select: { qrCodeId: true },
      take: 50,
      orderBy: { scannedAt: 'desc' },
    }),
    prisma.userFavorite.findMany({
      where: { customerId },
      include: { product: { select: { brandName: true, skinType: true } } },
    }),
  ]);

  const qrCodes = await prisma.qrCode.findMany({
    where: { id: { in: scanLogs.map((s: any) => s.qrCodeId) } },
    select: { id: true, code: true, productId: true },
  });
  const idToProductId = new Map(qrCodes.map((q: any) => [q.id, q.productId]));
  const scannedProductIds = new Set(
    scanLogs.map((s: any) => idToProductId.get(s.qrCodeId)).filter(Boolean)
  );

  const favoriteIds = new Set(favorites.map((f: any) => f.productId));
  const favoriteBrands = new Set(favorites.map((f: any) => f.product?.brandName).filter(Boolean));
  const favoriteSkinTypes = new Set(
    favorites.map((f: any) => f.product?.skinType).filter((v: any) => typeof v === 'string')
  );

  const trending = await prisma.qrCode.findMany({
    where: { isActive: true },
    select: { productId: true, scanCount: true },
    orderBy: { scanCount: 'desc' },
    take: 30,
  });
  const trendingIds = trending
    .filter((t: any) => !scannedProductIds.has(t.productId))
    .map((t: any) => t.productId)
    .slice(0, 10);

  const where: any = { status: 'PUBLISHED', id: { notIn: Array.from(scannedProductIds) } };
  if (skinTypeFilter) where.skinType = skinTypeFilter;
  else if (favoriteSkinTypes.size > 0) where.skinType = { in: Array.from(favoriteSkinTypes) };
  if (brandFilter) where.brandName = { contains: brandFilter, mode: 'insensitive' };
  else if (favoriteBrands.size > 0) where.brandName = { in: Array.from(favoriteBrands) };

  const candidates = await prisma.product.findMany({
    where,
    include: { qrCodes: { select: { scanCount: true } } },
    take: 60,
  });

  const scored = candidates
    .map((p: any) => ({
      ...p,
      _score: scoreProduct(p, favoriteSkinTypes, favoriteBrands, trendingIds),
    }))
    .sort((a: any, b: any) => b._score - a._score);

  const total = scored.length;
  const paginated = scored.slice((page - 1) * limit, page * limit).map(({ _score, ...p }: any) => ({ ...p }));

  return NextResponse.json({
    success: true,
    products: paginated,
    pagination: { page, limit, total },
    profile: {
      skinType: Array.from(favoriteSkinTypes).slice(0, 3),
      brands: Array.from(favoriteBrands).slice(0, 5),
      scannedCount: scannedProductIds.size,
    },
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

async function feedPublic(limit: number, skinType?: string, brand?: string) {
  const where: any = { status: 'PUBLISHED' };
  if (skinType) where.skinType = skinType;
  if (brand) where.brandName = { contains: brand, mode: 'insensitive' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, name: true, brandName: true, skinType: true, imageUrl: true, suitableFor: true, tags: true, status: true, createdAt: true },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ success: true, products, pagination: { page: 1, limit, total }, profile: { skinType: [], brands: [], scannedCount: 0 } });
}
