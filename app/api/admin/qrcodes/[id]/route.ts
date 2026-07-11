import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';

const qrPatchSchema = z.object({ isActive: z.boolean() });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();

    const parsed = qrPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'isActive phải là boolean' },
        { status: 400 }
      );
    }

    const existing = await prisma.qrCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy mã QR' },
        { status: 404 }
      );
    }

    const updated = await prisma.qrCode.update({
      where: { id },
      data: { isActive: parsed.data.isActive },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating QR code:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi cập nhật mã QR' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const { id } = await params;

    const existing = await prisma.qrCode.findUnique({
      where: { id },
      select: { id: true, code: true, scanCount: true },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy mã QR' },
        { status: 404 }
      );
    }

    if (existing.scanCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể xóa mã QR "${existing.code}" vì đã có lịch sử quét`,
        },
        { status: 400 }
      );
    }

    const scanLogs = await prisma.scanLog.count({ where: { qrCodeId: id } });
    if (scanLogs > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể xóa mã QR "${existing.code}" vì đã có lịch sử quét`,
        },
        { status: 400 }
      );
    }

    await prisma.qrCode.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi xóa mã QR' },
      { status: 500 }
    );
  }
}
