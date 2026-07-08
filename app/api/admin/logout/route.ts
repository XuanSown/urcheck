import { NextResponse } from 'next/server';
import { logoutAdmin } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Đăng xuất thành công' },
    { status: 200 }
  );

  return logoutAdmin(response);
}
