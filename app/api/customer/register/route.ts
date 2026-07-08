import { NextResponse } from 'next/server';
import { registerCustomer, setCustomerSessionCookie, logCustomerAction } from '@/lib/customer-auth';
import { validatePasswordComplexity } from '@/lib/password-validation';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ').max(255, 'Email quá dài'),
  password: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự').max(128, 'Mật khẩu quá dài'),
});

const REGISTER_WINDOW = 60 * 60 * 1000;
const REGISTER_MAX = 3;
const registerAttempts = new Map<string, { count: number; resetTime: number }>();

function purgeRegister(now: number) {
  for (const [k, v] of Array.from(registerAttempts)) {
    if (now >= v.resetTime) registerAttempts.delete(k);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const now = Date.now();
    purgeRegister(now);
    const key = `customer:register:${ip}`;
    const bucket = registerAttempts.get(key);

    if (bucket && bucket.count >= REGISTER_MAX && now < bucket.resetTime) {
      const sec = Math.ceil((bucket.resetTime - now) / 1000);
      return NextResponse.json(
        { success: false, error: `Quá nhiều lần đăng ký. Thử lại sau ${Math.ceil(sec / 60)} phút` },
        { status: 429 }
      );
    }

    if (!bucket || now >= bucket.resetTime) {
      registerAttempts.set(key, { count: 0, resetTime: now + REGISTER_WINDOW });
    }

    const pwValidation = validatePasswordComplexity(password);
    if (!pwValidation.valid) {
      return NextResponse.json(
        { success: false, error: pwValidation.errors.join('. ') },
        { status: 400 }
      );
    }

    const result = await registerCustomer({ email, password });

    if (!result.success) {
      const b = registerAttempts.get(key);
      if (b) b.count += 1;
      await logCustomerAction({
        customerId: result.customerId,
        email,
        action: 'register',
        success: false,
        failureReason: result.error,
      });
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const b = registerAttempts.get(key);
    if (b) b.count += 1;

    if (result.token) {
      await setCustomerSessionCookie(result.token);
    }

    await logCustomerAction({
      customerId: result.customerId,
      email,
      action: 'register',
      success: true,
    });

    return NextResponse.json(
      { success: true, customerId: result.customerId },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/customer/register error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi hệ thống' },
      { status: 500 }
    );
  }
}
