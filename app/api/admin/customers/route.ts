import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search, isActive } = querySchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      isActive: searchParams.get('isActive') ?? undefined,
    });

    const where: Record<string, unknown> = {};
    if (isActive) {
      where.isActive = isActive === 'true';
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { deviceId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customerAccount.count({ where }),
      prisma.customerAccount.findMany({
        where,
        select: {
          id: true,
          deviceId: true,
          email: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          loginLogs: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const data = customers.map((c) => ({
      ...c,
      lastLogin: c.loginLogs[0]?.createdAt ?? null,
      loginLogs: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        customers: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi lấy danh sách khách hàng' },
      { status: 500 }
    );
  }
}
