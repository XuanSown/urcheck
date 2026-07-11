import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import prisma from '@/lib/db';
import type { Prisma, ReviewStatus } from '@prisma/client';

const VALID_STATUS = ['PENDING', 'APPROVED', 'REJECTED'] as const;

// GET /api/admin/reviews?page=&limit=&status=&productId=
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limitRaw = parseInt(searchParams.get('limit') || '20', 10) || 20;
    const limit = Math.min(100, Math.max(1, limitRaw));
    const status = (searchParams.get('status') || '').trim();
    const productId = (searchParams.get('productId') || '').trim();

    const where: Prisma.ProductReviewWhereInput = {};
    if (status && (VALID_STATUS as readonly string[]).includes(status)) {
      where.status = status as ReviewStatus;
    }
    if (productId) {
      where.productId = productId;
    }

    const [total, reviews] = await Promise.all([
      prisma.productReview.count({ where }),
      prisma.productReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          productId: true,
          customerId: true,
          rating: true,
          title: true,
          body: true,
          isVerifiedPurchase: true,
          helpfulCount: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          product: { select: { id: true, name: true } },
          customer: { select: { id: true, email: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: { page, limit, total, totalPages },
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi tải danh sách đánh giá' },
      { status: 500 }
    );
  }
}
