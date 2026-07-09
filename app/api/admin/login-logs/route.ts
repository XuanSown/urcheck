import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminApi } from '@/lib/auth';

export async function GET() {
  const guard = await requireAdminApi();
  if ('error' in guard) return guard.error;

  try {
    const logs = await prisma.adminLoginLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: { logs: logs.map((l) => ({
        id: l.id,
        username: l.username,
        success: l.success,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        createdAt: l.createdAt.toISOString(),
      })) },
    });
  } catch (error) {
    console.error('Login logs error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tải nhật ký' }, { status: 500 });
  }
}
