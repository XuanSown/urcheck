import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const result = await loginAdmin(validated.username, validated.password);

    if (!result.success || !result.sessionToken) {
      return NextResponse.json(
        { success: false, error: result.error || 'Đăng nhập thất bại' },
        { status: 401 }
      );
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: { username: validated.username },
    });

    response.cookies.set('admin_session', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }

    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi, vui lòng thử lại' },
      { status: 500 }
    );
  }
}
