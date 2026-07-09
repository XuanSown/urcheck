import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const { id } = await params;

    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Bộ sưu tập không tồn tại' },
        { status: 404 }
      );
    }

    // Delete items first to avoid issues if cascade is not enforced by the DB driver
    await prisma.collectionItem.deleteMany({
      where: { collectionId: id },
    });
    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa bộ sưu tập' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi xóa bộ sưu tập' },
      { status: 500 }
    );
  }
}
