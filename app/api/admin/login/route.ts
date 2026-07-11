import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth';
import { signAdminSession } from '@/lib/session';
import { defaultRateLimiter } from '@/lib/security';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  twoFactorToken: z.string().optional(),
});

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Du lieu khong hop le' }, { status: 400 });
    }
    const validated = loginSchema.parse(body);

    const rate = await defaultRateLimiter.check(request, 'admin:login');
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Quá nhiều lần thử. Vui lòng thử lại sau ${rate.retryAfter} giây.` },
        { status: 429 }
      );
    }

    const result = await loginAdmin(validated.username, validated.password, {
      ipAddress: getIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      twoFactorToken: validated.twoFactorToken,
    });

    if (!result.success) {
      // 2FA step pending — let the form prompt for the code (still 200).
      if (result.twoFactorRequired) {
        return NextResponse.json({ success: false, twoFactorRequired: true });
      }
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

    const secure = request.headers.get('x-forwarded-proto') === 'https';

    response.cookies.set({
      name: 'admin_session',
      value: jwtToken,
      httpOnly: true,
      secure,
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
