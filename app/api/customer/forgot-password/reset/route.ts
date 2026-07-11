import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/customer-auth';
import { validatePasswordComplexity } from '@/lib/password-validation';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body as Record<string, unknown>;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || typeof otp !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }

    const trimmed = email.trim().toLowerCase();

    const pwValidation = validatePasswordComplexity(newPassword);
    if (!pwValidation.valid) {
      return NextResponse.json(
        { success: false, error: pwValidation.errors.join('. ') },
        { status: 400 }
      );
    }

    const rl = await checkRateLimit('otp', `otp-reset:${trimmed}`);
    if (rl.limited) {
      return NextResponse.json(
        { success: false, error: `Quá nhiều lần thử. Vui lòng thử lại sau ${Math.ceil(rl.retryAfterSec / 60)} phút` },
        { status: 429 }
      );
    }

    const record = await prisma.otpVerification.findFirst({
      where: {
        email: trimmed,
        otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Mã OTP không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.customerAccount.updateMany({
        where: { email: trimmed },
        data: { password: hashedPassword },
      }),
      prisma.otpVerification.update({
        where: { id: record.id },
        data: { isUsed: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    console.error('POST /api/customer/forgot-password/reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi hệ thống' },
      { status: 500 }
    );
  }
}
