import { NextResponse } from 'next/server';
import { requireCustomerApi } from '@/lib/customer-auth';
import { getBadgesForCustomer } from '@/lib/badge-service';

export async function GET(request: Request) {
  const guard = await requireCustomerApi();
  if ('error' in guard) return guard.error;

  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get('locale') || 'vi') as 'vi' | 'en';

  const badges = await getBadgesForCustomer(guard.session.customerId, locale);

  return NextResponse.json({ success: true, badges });
}
