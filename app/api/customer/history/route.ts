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
    }),
    prisma.scanLog.count({
      where: { customerId: guard.session.customerId },
    }),
  ]);

  const qrCodes = logs
    .map((l) => l.qrCode.replace('QR:', ''))
    .filter(Boolean);

  const qrRecords = qrCodes.length
    ? await prisma.qrCode.findMany({
        where: { code: { in: qrCodes } },
        select: {
          code: true,
          productId: true,
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              brandName: true,
              verified: true,
              manufactureDate: true,
              expiryDate: true,
              imageUrl: true,
            },
          },
        },
      })
    : [];

  const productMap = new Map(qrRecords.map((q) => [q.code, q]));

  const items = logs.map((log) => {
    const rawCode = log.qrCode.replace('QR:', '');
    const qr = productMap.get(rawCode);
    const isExpired = qr?.product?.expiryDate
      ? new Date(qr.product.expiryDate) < new Date()
      : false;
    const isValid = qr?.product?.verified && !isExpired;

    return {
      scannedAt: log.scannedAt.toISOString(),
      isValid: isValid ?? false,
      status: isValid
        ? 'valid'
        : isExpired
        ? 'expired'
        : 'unverified',
      product: qr?.product
        ? {
            id: qr.product.id,
            name: qr.product.name,
            brandName: qr.product.brandName,
            imageUrl: qr.product.imageUrl,
            verified: qr.product.verified,
            expiryDate: qr.product.expiryDate
              ? qr.product.expiryDate.toISOString()
              : null,
          }
        : null,
      qrCode: rawCode,
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
