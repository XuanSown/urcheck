import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/auth';
import prisma from '@/lib/db';
import type { Prisma } from '@prisma/client';

const supportArticleSchema = z.object({
  slug: z.string().min(1, 'Slug là bắt buộc').max(255),
  titleVi: z.string().min(1, 'Tiêu đề (VI) là bắt buộc').max(500),
  titleEn: z.string().min(1, 'Tiêu đề (EN) là bắt buộc').max(500),
  bodyVi: z.string().max(20000).optional().nullable(),
  bodyEn: z.string().max(20000).optional().nullable(),
  category: z.string().min(1, 'Danh mục là bắt buộc').max(255),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  order: z.number().int().optional(),
});

// GET /api/admin/support?search=&category=
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const category = (searchParams.get('category') || '').trim();

    const where: Prisma.SupportArticleWhereInput = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { titleVi: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const articles = await prisma.supportArticle.findMany({
      where,
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        titleVi: true,
        titleEn: true,
        category: true,
        status: true,
        order: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error('Get support articles error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi tải danh sách bài viết hỗ trợ' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const data = supportArticleSchema.parse(body);

    const existing = await prisma.supportArticle.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Slug đã tồn tại, vui lòng chọn slug khác' },
        { status: 409 }
      );
    }

    const article = await prisma.supportArticle.create({
      data: {
        slug: data.slug,
        titleVi: data.titleVi,
        titleEn: data.titleEn,
        bodyVi: data.bodyVi,
        bodyEn: data.bodyEn,
        category: data.category,
        status: data.status,
        order: data.order ?? 0,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Tạo bài viết hỗ trợ thành công', data: article },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create support article error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', details: error.issues },
        { status: 400 }
      );
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ success: false, error: 'Slug đã tồn tại' }, { status: 409 });
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
