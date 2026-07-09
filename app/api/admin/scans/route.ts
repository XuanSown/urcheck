import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = (searchParams.get('search') || '').trim().slice(0, 200);
    const productId = (searchParams.get('productId') || '').trim();

    const skip = (page - 1) * limit;

    const where: any = {};

    if (productId) {
      where.qrCode = { productId };
    }

    if (search) {
      where.OR = [
        { qrCode: { code: { contains: search, mode: 'insensitive' } } },
        { qrCode: { product: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [scans, total] = await Promise.all([
      prisma.scanLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scannedAt: 'desc' },
        include: {
          qrCode: {
            select: {
              code: true,
              product: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.scanLog.count({ where }),
    ]);

    const formattedScans = scans.map((s) => ({
      id: s.id,
      scannedAt: s.scannedAt.toISOString(),
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      qrCode: { code: s.qrCode.code },
      product: { id: s.qrCode.product.id, name: s.qrCode.product.name },
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        scans: formattedScans,
        pagination: { page, limit, total, totalPages },
      },
    });
  } catch (error) {
    console.error('Error fetching scan logs:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi lấy lịch sử quét QR' },
      { status: 500 }
    );
  }
}
