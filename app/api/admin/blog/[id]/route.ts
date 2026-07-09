import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi();
    if ('error' in auth) return auth.error;
    const { id } = await params;

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ success: false, error: 'Bài viết không tồn tại' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Get blog post error:', error);
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

    const data = await request.json();
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Bài viết không tồn tại' }, { status: 404 });
    }

    const newStatus = data.status ?? existing.status;
    const wasPublished = existing.status === 'PUBLISHED';
    const nowPublished = newStatus === 'PUBLISHED';

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        slug: data.slug ?? existing.slug,
        titleVi: data.titleVi ?? existing.titleVi,
        titleEn: data.titleEn ?? existing.titleEn,
        excerptVi: data.excerptVi !== undefined ? data.excerptVi : existing.excerptVi,
        excerptEn: data.excerptEn !== undefined ? data.excerptEn : existing.excerptEn,
        bodyVi: data.bodyVi !== undefined ? data.bodyVi : existing.bodyVi,
        bodyEn: data.bodyEn !== undefined ? data.bodyEn : existing.bodyEn,
        coverUrl: data.coverUrl !== undefined ? data.coverUrl : existing.coverUrl,
        author: data.author !== undefined ? data.author : existing.author,
        status: newStatus,
        publishedAt:
          nowPublished && !wasPublished
            ? new Date()
            : data.publishedAt !== undefined
              ? data.publishedAt
              : existing.publishedAt,
      },
    });

    return NextResponse.json({ success: true, message: 'Cập nhật bài viết thành công', data: post });
  } catch (error) {
    console.error('Update blog post error:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
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

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Bài viết không tồn tại' }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Xóa bài viết thành công' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
