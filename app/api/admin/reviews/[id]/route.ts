import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/auth';
import prisma from '@/lib/db';

const moderateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

// PATCH /api/admin/reviews/[id]  { status: 'APPROVED' | 'REJECTED' }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;
    const { id } = await params;

    const existing = await prisma.productReview.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Đánh giá không tồn tại' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { status } = moderateSchema.parse(body);

    const review = await prisma.productReview.update({
      where: { id },
      data: { status },
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
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error('Moderate review error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Trạng thái không hợp lệ', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

// DELETE /api/admin/reviews/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;
    const { id } = await params;

    const existing = await prisma.productReview.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Đánh giá không tồn tại' }, { status: 404 });
    }

    await prisma.productReview.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Xóa đánh giá thành công' });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
