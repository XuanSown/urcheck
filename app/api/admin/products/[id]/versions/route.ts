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

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    const versions = await prisma.productVersion.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formattedVersions = versions.map(version => ({
      id: version.id,
      productSnapshot: version.productSnapshot,
      changedBy: version.changedBy,
      changeReason: version.changeReason,
      createdAt: version.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedVersions,
    });
  } catch (error) {
    console.error('Get product versions error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi' },
      { status: 500 }
    );
  }
}
