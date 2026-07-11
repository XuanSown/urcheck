import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/auth';
import prisma from '@/lib/db';
import type { Prisma, ContentStatus } from '@prisma/client';
import { sanitizeForPrisma, escapeHtml } from '@/lib/security';

const blogPostSchema = z.object({
  slug: z.string().min(1, 'Slug là bắt buộc').max(255),
  titleVi: z.string().min(1, 'Tiêu đề (VI) là bắt buộc').max(500),
  titleEn: z.string().min(1, 'Tiêu đề (EN) là bắt buộc').max(500),
  excerptVi: z.string().max(2000).optional().nullable(),
  excerptEn: z.string().max(2000).optional().nullable(),
  bodyVi: z.string().optional().nullable(),
  bodyEn: z.string().optional().nullable(),
  coverUrl: z.string().max(2000).optional().nullable(),
  author: z.string().max(255).optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

// GET /api/admin/blog?status=&search=
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || '').trim();
    const search = (searchParams.get('search') || '').trim();

    const where: Prisma.BlogPostWhereInput = {};
    if (status && ['DRAFT', 'PUBLISHED'].includes(status)) {
      where.status = status as ContentStatus;
    }
    if (search) {
      where.OR = [
        { titleVi: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        titleVi: true,
        titleEn: true,
        status: true,
        author: true,
        publishedAt: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error('Get blog posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi tải danh sách bài viết' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const parsed = blogPostSchema.parse(body);
    const data = sanitizeForPrisma(parsed) as typeof parsed;

    const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Slug đã tồn tại, vui lòng chọn slug khác' },
        { status: 409 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        slug: data.slug,
        titleVi: data.titleVi,
        titleEn: data.titleEn,
        excerptVi: data.excerptVi,
        excerptEn: data.excerptEn,
        bodyVi: data.bodyVi ? escapeHtml(data.bodyVi) : data.bodyVi,
        bodyEn: data.bodyEn ? escapeHtml(data.bodyEn) : data.bodyEn,
        coverUrl: data.coverUrl,
        author: data.author,
        status: data.status,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, message: 'Tạo bài viết thành công', data: post }, { status: 201 });
  } catch (error) {
    console.error('Create blog post error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', details: error.issues },
        { status: 400 }
      );
    }
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Slug đã tồn tại' }, { status: 409 });
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
