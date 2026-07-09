import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
    const search = searchParams.get('search')?.trim() || '';
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam === null ? undefined : isActiveParam === 'true';

    const where = {
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: 'insensitive' as const } },
              { product: { name: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };

    const [qrCodes, total] = await Promise.all([
      prisma.qrCode.findMany({
        where,
        select: {
          id: true,
          code: true,
          url: true,
          scanCount: true,
          isActive: true,
          createdAt: true,
          product: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.qrCode.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        qrCodes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi lấy danh sách mã QR' },
      { status: 500 }
    );
  }
}
