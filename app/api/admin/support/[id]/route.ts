import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/auth';
import prisma from '@/lib/db';
import { escapeHtml } from '@/lib/security';

const supportUpdateSchema = z.object({
  slug: z.string().min(1).max(255).optional(),
  titleVi: z.string().min(1).max(500).optional(),
  titleEn: z.string().min(1).max(500).optional(),
  bodyVi: z.string().max(20000).nullable().optional(),
  bodyEn: z.string().max(20000).nullable().optional(),
  category: z.string().min(1).max(255).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  order: z.number().int().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;
    const { id } = await params;

    const article = await prisma.supportArticle.findUnique({ where: { id } });
    if (!article) {
      return NextResponse.json({ success: false, error: 'Bài viết không tồn tại' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error('Get support article error:', error);
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;
    const { id } = await params;

    const rawData = await request.json();
    const parsed = supportUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.format() }, { status: 400 });
    }
    const data = parsed.data;
    const existing = await prisma.supportArticle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Bài viết không tồn tại' }, { status: 404 });
    }

    const article = await prisma.supportArticle.update({
      where: { id },
      data: {
        slug: data.slug ?? existing.slug,
        titleVi: data.titleVi ?? existing.titleVi,
        titleEn: data.titleEn ?? existing.titleEn,
        bodyVi: data.bodyVi !== undefined ? (data.bodyVi ? escapeHtml(data.bodyVi) : data.bodyVi) : existing.bodyVi,
        bodyEn: data.bodyEn !== undefined ? (data.bodyEn ? escapeHtml(data.bodyEn) : data.bodyEn) : existing.bodyEn,
        category: data.category ?? existing.category,
        status: data.status ?? existing.status,
        order: data.order !== undefined ? data.order : existing.order,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật bài viết hỗ trợ thành công',
      data: article,
    });
  } catch (error) {
    console.error('Update support article error:', error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ success: false, error: 'Slug đã tồn tại' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;
    const { id } = await params;

    const existing = await prisma.supportArticle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Bài viết không tồn tại' }, { status: 404 });
    }

    await prisma.supportArticle.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Xóa bài viết hỗ trợ thành công' });
  } catch (error) {
    console.error('Delete support article error:', error);
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
