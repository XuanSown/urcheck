import { NextResponse } from 'next/server';
import { loginCustomer, setCustomerSessionCookie } from '@/lib/customer-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import type { NextRequest } from 'next/server';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const secure = request.headers.get('x-forwarded-proto') === 'https';

    const lim = await checkRateLimit('login', ip);
    if (lim.limited) {
      return NextResponse.json(
        { success: false, error: `Quá nhiều lần đăng nhập thất bại. Thử lại sau ${Math.ceil(lim.retryAfterSec / 60)} phút` },
        { status: 429 }
      );
    }

    const result = await loginCustomer({
      email: parsed.data.email,
      password: parsed.data.password,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') ?? '',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    await setCustomerSessionCookie(result.token!, secure);
    return NextResponse.json(
      { success: true, message: 'Đăng nhập thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/customer/login error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi hệ thống' },
      { status: 500 }
    );
  }
}
