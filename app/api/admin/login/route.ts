import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth';
import { signAdminSession } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import prisma from '@/lib/db';

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

    const rate = await checkRateLimit('login', getIp(request));
    if (rate.limited) {
      return NextResponse.json(
        { success: false, error: `Quá nhiều lần thử. Vui lòng thử lại sau ${rate.retryAfterSec} giây.` },
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

    // Fetch user with tokenVersion for session token
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: result.user!.id },
      select: { id: true, username: true, role: true, tokenVersion: true },
    });

    const jwtToken = await signAdminSession({
      userId: adminUser!.id,
      username: adminUser!.username,
      role: adminUser!.role,
      tokenVersion: adminUser!.tokenVersion,
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
