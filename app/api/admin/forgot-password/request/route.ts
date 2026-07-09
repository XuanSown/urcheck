import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendOtpEmail } from '@/lib/mailer';
import crypto from 'crypto';
import { defaultRateLimiter } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const rate = await defaultRateLimiter.check(request, 'admin:forgot');
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Quá nhiều lần thử. Vui lòng thử lại sau ${rate.retryAfter} giây.` },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Vui lòng cung cấp email' }, { status: 400 });
    }

    // Check if an admin with this email exists
    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success anyway to prevent email enumeration attacks
      return NextResponse.json({ success: true, message: 'Nếu email tồn tại, một mã OTP đã được gửi.' });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save to database
    await prisma.otpVerification.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send email
    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true, message: 'Mã OTP đã được gửi thành công.' });
  } catch (error) {
    console.error('Lỗi khi yêu cầu OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi hệ thống' },
      { status: 500 }
    );
  }
}
