import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';
import { generateSecret, otpauthUri } from '@/lib/twofactor';

export async function POST() {
  const guard = await requireAdminApi();
  if ('error' in guard) return guard.error;

  const user = guard.user!;
  if (user.twoFactorEnabled) {
    return NextResponse.json({ success: false, error: '2FA đã được bật' }, { status: 400 });
  }

  try {
    const secret = generateSecret();
    // Stash the unconfirmed secret on the user; only mark enabled on confirm.
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({
      success: true,
      data: {
        secret,
        otpauthUri: otpauthUri(secret, user.username || user.email || user.id),
      },
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tạo mã 2FA' }, { status: 500 });
  }
}
