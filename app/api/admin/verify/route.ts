import { NextResponse } from 'next/server';
import { verifySession, getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 401 }
    );
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
    },
  });
}
