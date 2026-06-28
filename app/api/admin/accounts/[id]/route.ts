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

    // Prevent deleting the currently logged-in user
    if (authResult.user.id === id) {
      return NextResponse.json(
        { success: false, error: 'Không thể tự xóa tài khoản của chính mình' },
        { status: 403 }
      );
    }

    const userToDelete = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản không tồn tại' },
        { status: 404 }
      );
    }

    // Delete the user
    await prisma.adminUser.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa tài khoản' });
  } catch (error) {
    console.error('Error deleting admin account:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi xóa tài khoản' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { email, password, isActive } = body;

    // Optional: Prevent disabling own account to avoid getting locked out
    if (authResult.user.id === id && isActive === false) {
      return NextResponse.json(
        { success: false, error: 'Không thể tự khóa tài khoản của chính mình' },
        { status: 403 }
      );
    }

    const userToUpdate = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản không tồn tại' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (email !== undefined) {
      updateData.email = email || null; // allow clearing email
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    if (password) {
      const bcrypt = (await import('bcrypt')).default;
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating admin account:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi cập nhật tài khoản' },
      { status: 500 }
    );
  }
}
