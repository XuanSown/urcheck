import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
  customerId: z.string().trim().optional(),
});

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search, customerId } = querySchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      customerId: searchParams.get('customerId') ?? undefined,
    });

    const where: Record<string, unknown> = {};
    if (customerId) {
      where.customerId = customerId;
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [total, collections] = await Promise.all([
      prisma.collection.count({ where }),
      prisma.collection.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          colorHex: true,
          sortOrder: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              email: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        collections,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi lấy danh sách bộ sưu tập' },
      { status: 500 }
    );
  }
}
