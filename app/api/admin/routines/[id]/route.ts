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

    const routine = await prisma.routine.findUnique({
      where: { id },
    });

    if (!routine) {
      return NextResponse.json(
        { success: false, error: 'Quy trình không tồn tại' },
        { status: 404 }
      );
    }

    await prisma.routineItem.deleteMany({
      where: { routineId: id },
    });
    await prisma.routine.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa quy trình' });
  } catch (error) {
    console.error('Error deleting routine:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi xóa quy trình' },
      { status: 500 }
    );
  }
}
