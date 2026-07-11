import { NextResponse } from 'next/server';
import { registerCustomer, setCustomerSessionCookie, logCustomerAction } from '@/lib/customer-auth';
import { validatePasswordComplexity } from '@/lib/password-validation';
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ').max(255, 'Email quá dài'),
  password: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự').max(128, 'Mật khẩu quá dài'),
});

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

    const secure = request.headers.get('x-forwarded-proto') === 'https';

    const lim = checkRateLimit('register', ip, { windowMs: 60 * 60 * 1000, max: 3 });
    if (lim.limited) {
      return NextResponse.json(
        { success: false, error: `Quá nhiều lần đăng ký. Thử lại sau ${Math.ceil(lim.retryAfterSec / 60)} phút` },
        { status: 429 }
      );
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
      incrementRateLimit('register', ip);
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

    if (result.token) {
      await setCustomerSessionCookie(result.token, secure);
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
