import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcrypt';
import { checkRateLimit } from '@/lib/rate-limit';
import { validatePasswordComplexity } from '@/lib/password-validation';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rate = await checkRateLimit('login', `${ip}:reset`);
    if (rate.limited) {
      return NextResponse.json(
        { success: false, error: `Quá nhiều lần thử. Vui lòng thử lại sau ${rate.retryAfterSec} giây.` },
        { status: 429 }
      );
    }

    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ thông tin' },
        { status: 400 }
      );
    }

    const pwValidation = validatePasswordComplexity(newPassword);
    if (!pwValidation.valid) {
      return NextResponse.json(
        { success: false, error: pwValidation.errors.join(' ') },
        { status: 400 }
      );
    }

    // Check OTP validity
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email,
        otp,
        isUsed: false,
        expiresAt: {
          gt: new Date(), // must be strictly greater than current time
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'Mã OTP không hợp lệ hoặc đã hết hạn.' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.adminUser.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'Đặt lại mật khẩu thành công.' });
  } catch (error) {
    console.error('Lỗi khi đặt lại mật khẩu:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi hệ thống' },
      { status: 500 }
    );
  }
}
