import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/customer-auth';

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    customer: {
      id: session.customerId,
      email: session.email,
      role: session.role,
    },
  });
}
