import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';
import { verifyToken } from '@/lib/twofactor';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const schema = z.object({ token: z.string().min(1) });

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ('error' in guard) return guard.error;

  const user = guard.user!;

  const rl = await checkRateLimit('login', `2fa-confirm:${user.id}`);
  if (rl.limited) {
    return NextResponse.json(
      { success: false, error: `Quá nhiều lần thử. Vui lòng thử lại sau ${Math.ceil(rl.retryAfterSec / 60)} phút` },
      { status: 429 }
    );
  }

  try {
    const body = schema.parse(await request.json());
    const current = await prisma.adminUser.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!current?.twoFactorSecret) {
      return NextResponse.json({ success: false, error: 'Chưa khởi tạo 2FA' }, { status: 400 });
    }

    if (!verifyToken(current.twoFactorSecret, body.token)) {
      return NextResponse.json({ success: false, error: 'Mã xác thực không đúng' }, { status: 400 });
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ success: true, message: 'Đã bật xác thực 2 bước' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Mã không hợp lệ' }, { status: 400 });
    }
    console.error('2FA confirm error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi xác nhận 2FA' }, { status: 500 });
  }
}
