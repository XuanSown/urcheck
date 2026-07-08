import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth';
import { signAdminSession, setAdminSessionCookie } from '@/lib/session';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Du lieu khong hop le' }, { status: 400 });
    }
    const validated = loginSchema.parse(body);

    const result = await loginAdmin(validated.username, validated.password);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Đang nhap that bai' }, { status: 401 });
    }

    const jwtToken = await signAdminSession({
      userId: result.user!.id,
      username: result.user!.username,
      role: result.user!.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: { username: validated.username },
    });

    response.cookies.set({
      name: 'admin_session',
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Du lieu khong hop le' }, { status: 400 });
    }
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, error: 'Đa xay ra loi, vui long thu lai' }, { status: 500 });
  }
}
