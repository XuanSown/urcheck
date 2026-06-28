import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';

export async function GET() {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching admin accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi lấy danh sách tài khoản' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireAdminApi();
  if ('error' in authResult) return authResult.error;

  try {
    const { username, email, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu' },
        { status: 400 }
      );
    }

    // Check if username exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Tên đăng nhập đã tồn tại' },
        { status: 400 }
      );
    }

    // Check if email exists (if provided)
    if (email) {
      const existingEmail = await prisma.adminUser.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Email đã tồn tại' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.adminUser.create({
      data: {
        username,
        email: email || null,
        password: hashedPassword,
        role: 'ADMIN',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin account:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi tạo tài khoản' },
      { status: 500 }
    );
  }
}
