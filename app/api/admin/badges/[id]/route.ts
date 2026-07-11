import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const updateBadgeSchema = z.object({
  name: z.string().trim().min(1, 'Tên huy hiệu là bắt buộc').max(255).optional(),
  descriptionVi: z.string().trim().min(1, 'Mô tả tiếng Việt là bắt buộc').max(2000).optional(),
  descriptionEn: z.string().trim().min(1, 'Mô tả tiếng Anh là bắt buộc').max(2000).optional(),
  icon: z.string().trim().min(1, 'Biểu tượng là bắt buộc').max(100).optional(),
  criteriaJson: z.record(z.string(), z.unknown()).optional(),
  order: z.number().int().min(0).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateBadgeSchema.parse(body);

    const existing = await prisma.badge.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Huy hiệu không tồn tại' },
        { status: 404 }
      );
    }

    const updateData: Prisma.BadgeUpdateInput = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.descriptionVi !== undefined) updateData.descriptionVi = parsed.descriptionVi;
    if (parsed.descriptionEn !== undefined) updateData.descriptionEn = parsed.descriptionEn;
    if (parsed.icon !== undefined) updateData.icon = parsed.icon;
    if (parsed.criteriaJson !== undefined) updateData.criteriaJson = parsed.criteriaJson as unknown as Prisma.InputJsonValue;
    if (parsed.order !== undefined) updateData.order = parsed.order;

    const badge = await prisma.badge.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        descriptionVi: true,
        descriptionEn: true,
        icon: true,
        criteriaJson: true,
        order: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: badge });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }
    console.error('Error updating badge:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi cập nhật huy hiệu' },
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

    const existing = await prisma.badge.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Huy hiệu không tồn tại' },
        { status: 404 }
      );
    }

    await prisma.badge.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Đã xóa huy hiệu' });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi xóa huy hiệu' },
      { status: 500 }
    );
  }
}
