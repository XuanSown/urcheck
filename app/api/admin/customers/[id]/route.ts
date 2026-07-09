import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';

const updateSchema = z.object({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive, isVerified } = updateSchema.parse(body);

    if (isActive === undefined && isVerified === undefined) {
      return NextResponse.json(
        { success: false, error: 'Không có trường nào được cập nhật' },
        { status: 400 }
      );
    }

    const existing = await prisma.customerAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Khách hàng không tồn tại' },
        { status: 404 }
      );
    }

    const updated = await prisma.customerAccount.update({
      where: { id },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(isVerified !== undefined ? { isVerified } : {}),
      },
      select: {
        id: true,
        deviceId: true,
        email: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi cập nhật khách hàng' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const { id } = await params;

    const existing = await prisma.customerAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Khách hàng không tồn tại' },
        { status: 404 }
      );
    }

    await prisma.customerAccount.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi xóa khách hàng' },
      { status: 500 }
    );
  }
}
