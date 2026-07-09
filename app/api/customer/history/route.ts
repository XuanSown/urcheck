import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireCustomerApi } from '@/lib/customer-auth';

export async function GET(request: Request) {
  const guard = await requireCustomerApi();
  if ('error' in guard) return guard.error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.scanLog.findMany({
      where: { customerId: guard.session.customerId },
      orderBy: { scannedAt: 'desc' },
      skip,
      take: limit,
      include: {
        qrCode: {
          select: {
            code: true,
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                brandName: true,
                verified: true,
                manufactureDate: true,
                expiryDate: true,
                images: { where: { isPrimary: true }, take: 1, select: { url: true } },
              },
            },
          },
        },
      },
    }),
    prisma.scanLog.count({ where: { customerId: guard.session.customerId } }),
  ]);

  const items = logs.map((log) => {
    const qr = log.qrCode;
    const product = qr?.product;
    const imageUrl = product?.images?.[0]?.url ?? null;
    const isExpired = product?.expiryDate ? new Date(product.expiryDate) < new Date() : false;
    const isValid = product?.verified && !isExpired;
    return {
      scannedAt: log.scannedAt.toISOString(),
      isValid: isValid ?? false,
      status: isValid ? 'valid' : isExpired ? 'expired' : 'unverified',
      product: product
        ? {
            id: product.id,
            name: product.name,
            brandName: product.brandName,
            imageUrl,
            verified: product.verified,
            expiryDate: product.expiryDate ? product.expiryDate.toISOString() : null,
          }
        : null,
      qrCode: qr?.code ?? null,
    };
  });

  return NextResponse.json({
    success: true,
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
