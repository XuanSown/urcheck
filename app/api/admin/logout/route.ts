import { NextResponse } from 'next/server';
import { logoutAdminWithInvalidation } from '@/lib/auth';

export async function POST() {
  return logoutAdminWithInvalidation();
}
