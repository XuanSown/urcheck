import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/customer-auth';
import { validatePasswordComplexity } from '@/lib/password-validation';

const RESET_RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RESET_RATE_LIMIT_MAX = 5;
const resetAttempts = new Map<string, { count: number; resetTime: number }>();

function cleanupResetRateLimit(now: number) {
  for (const [k, v] of Array.from(resetAttempts)) {
    if (now >= v.resetTime) resetAttempts.delete(k);
  }
}

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

    const now = Date.now();
    cleanupResetRateLimit(now);
    const rlKey = `otp-reset:${trimmed}`;
    const rlBucket = resetAttempts.get(rlKey);

    if (rlBucket && rlBucket.count >= RESET_RATE_LIMIT_MAX && now < rlBucket.resetTime) {
      const retrySec = Math.ceil((rlBucket.resetTime - now) / 1000);
      return NextResponse.json(
        { success: false, error: `Quá nhiều lần thử. Vui lòng thử lại sau ${Math.ceil(retrySec / 60)} phút` },
        { status: 429 }
      );
    }

    if (!rlBucket || now >= rlBucket.resetTime) {
      resetAttempts.set(rlKey, { count: 1, resetTime: now + RESET_RATE_LIMIT_WINDOW });
    } else {
      rlBucket.count += 1;
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
