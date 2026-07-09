import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';
import { z } from 'zod';

const createBadgeSchema = z.object({
  name: z.string().trim().min(1, 'Tên huy hiệu là bắt buộc').max(255),
  descriptionVi: z.string().trim().min(1, 'Mô tả tiếng Việt là bắt buộc').max(2000),
  descriptionEn: z.string().trim().min(1, 'Mô tả tiếng Anh là bắt buộc').max(2000),
  icon: z.string().trim().min(1, 'Biểu tượng là bắt buộc').max(100),
  criteriaJson: z.record(z.string(), z.unknown()).optional().default({}),
  order: z.number().int().min(0).optional(),
});

export async function GET() {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const badges = await prisma.badge.findMany({
      select: {
        id: true,
        name: true,
        descriptionVi: true,
        descriptionEn: true,
        icon: true,
        criteriaJson: true,
        order: true,
        createdAt: true,
        _count: {
          select: { customerBadges: true },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, data: badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi lấy danh sách huy hiệu' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const body = await request.json();
    const parsed = createBadgeSchema.parse(body);

    const badge = await prisma.badge.create({
      data: {
        name: parsed.name,
        descriptionVi: parsed.descriptionVi,
        descriptionEn: parsed.descriptionEn,
        icon: parsed.icon,
        criteriaJson: parsed.criteriaJson as any,
        order: parsed.order ?? 0,
      },
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

    return NextResponse.json({ success: true, data: badge }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }
    console.error('Error creating badge:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi tạo huy hiệu' },
      { status: 500 }
    );
  }
}
