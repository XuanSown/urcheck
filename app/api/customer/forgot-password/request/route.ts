import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendOtpEmail } from '@/lib/mailer';
import { logCustomerAction } from '@/lib/customer-auth';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const OTP_TTL_MS = 5 * 60 * 1000;

function generateOtp(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 10)).join('');
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp email' },
        { status: 400 }
      );
    }

    const trimmed = email.trim().toLowerCase();
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

    const recentCount = await prisma.otpVerification.count({
      where: {
        email: trimmed,
        createdAt: { gte: windowStart },
      },
    });

    if (recentCount >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng thử lại sau 15 phút.' },
        { status: 429 }
      );
    }

    await prisma.otpVerification.deleteMany({
      where: {
        email: trimmed,
        OR: [
          { isUsed: true },
          { expiresAt: { lt: now } },
        ],
      },
    });

    const activeOtp = await prisma.otpVerification.findFirst({
      where: { email: trimmed, isUsed: false, expiresAt: { gte: now } },
      orderBy: { createdAt: 'desc' },
    });

    if (activeOtp) {
      const remainingMs = activeOtp.expiresAt.getTime() - now.getTime();
      const remainingSec = Math.max(30, Math.floor(remainingMs / 1000));
      return NextResponse.json(
        {
          success: false,
          error: `Vui lòng đợi ${Math.ceil(remainingSec / 60)} phút trước khi yêu cầu mã mới.`,
        },
        { status: 429 }
      );
    }

    const otp = generateOtp();
    const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

    await prisma.otpVerification.create({
      data: {
        email: trimmed,
        otp,
        expiresAt,
      },
    });

    await sendOtpEmail(trimmed, otp);

    const customer = await prisma.customerAccount.findFirst({
      where: { email: trimmed, password: { not: null } },
    });

    if (customer) {
      await logCustomerAction({
        customerId: customer.id,
        email: customer.email,
        action: 'forgot_password',
        success: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Nếu email tồn tại, mã OTP đã được gửi.',
    });
  } catch (error) {
    console.error('POST /api/customer/forgot-password/request error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi hệ thống' },
      { status: 500 }
    );
  }
}
