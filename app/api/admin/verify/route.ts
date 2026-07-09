import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/session';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value ?? '';
  const session = await verifyAdminSession(token);

  if (!session) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }

  const user = await getCurrentAdmin();

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      id: user?.id,
      username: user?.username,
      email: user?.email,
      role: user?.role,
      twoFactorEnabled: user?.twoFactorEnabled,
    },
  });
}
