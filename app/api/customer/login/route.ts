import { NextResponse } from 'next/server';
import { loginCustomer, setCustomerSessionCookie } from '@/lib/customer-auth';
import { z } from 'zod';
import type { NextRequest } from 'next/server';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetTime: number }>();

function purge(now: number) {
  for (const [k, v] of Array.from(attempts)) {
    if (now >= v.resetTime) attempts.delete(k);
  }
}

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

    const now = Date.now();
    purge(now);
    const key = `customer:login:${ip}`;
    const bucket = attempts.get(key);

    if (bucket && bucket.count >= MAX_ATTEMPTS && now < bucket.resetTime) {
      const sec = Math.ceil((bucket.resetTime - now) / 1000);
      return NextResponse.json(
        { success: false, error: `Quá nhiều lần đăng nhập thất bại. Thử lại sau ${Math.ceil(sec / 60)} phút` },
        { status: 429 }
      );
    }

    if (!bucket || now >= bucket.resetTime) {
      attempts.set(key, { count: 0, resetTime: now + WINDOW_MS });
    }

    const result = await loginCustomer({
      email: parsed.data.email,
      password: parsed.data.password,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') ?? '',
    });

    if (!result.success) {
      const b = attempts.get(key);
      if (b) b.count += 1;
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
