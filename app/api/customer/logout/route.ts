import { NextResponse } from 'next/server';
import { logoutCustomer, verifySession, logCustomerAction } from '@/lib/customer-auth';

export async function POST(request: Request) {
  try {
    const requestedWith = request.headers.get('x-requested-with');
    if (requestedWith !== 'XMLHttpRequest') {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu không hợp lệ' },
        { status: 403 }
      );
    }

    const session = await verifySession();
    await logoutCustomer();

    if (session) {
      await logCustomerAction({
        customerId: session.customerId,
        action: 'logout',
        success: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/customer/logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi hệ thống' },
      { status: 500 }
    );
  }
}
