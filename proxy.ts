import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityHeaders, isOriginAllowed, defaultRateLimiter } from '@/lib/security';
import { verifyAdminSession, verifyCustomerSession } from '@/lib/session';

const PUBLIC_PATHS = ['/admin/login', '/api/health', '/api/customer/login', '/api/customer/register', '/favicon.ico'];
const STATIC_PREFIXES = ['/_next', '/uploads', '/public'];

function isPublic(path: string): boolean {
  return PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'));
}

function isStatic(path: string): boolean {
  return STATIC_PREFIXES.some(p => path.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const headers = new Headers(securityHeaders());
  const origin = request.headers.get('origin');
  if (origin && isOriginAllowed(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  headers.set('X-Request-ID', crypto.randomUUID());

  if (request.method === 'OPTIONS') {
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Max-Age', '86400');
    return new NextResponse(null, { status: 204, headers });
  }

  if (isStatic(path)) {
    return NextResponse.next({ headers });
  }

  const result = await defaultRateLimiter.check(request, path);
  if (!result.allowed) {
    headers.set('Retry-After', String(result.retryAfter ?? 60));
    return NextResponse.json({ error: 'Quá nhiều yêu cầu, vui lòng thử lại sau' }, { status: 429, headers });
  }

  const adminCookie = request.cookies.get('admin_session')?.value;
  const customerCookie = request.cookies.get('customer_session')?.value;

  if (!isPublic(path)) {
    let session = null;
    if (adminCookie) session = await verifyAdminSession(adminCookie);
    if (!session && customerCookie) session = await verifyCustomerSession(customerCookie);

    if (!session) {
      if (path.startsWith('/api/admin')) {
        return NextResponse.json({ success: false, error: 'Chưa đăng nhập hoặc phiên đã hết hạn' }, { status: 401, headers });
      }
      if (path.startsWith('/api/customer') && path !== '/api/customer/register') {
        return NextResponse.json({ success: false, error: 'Chưa đăng nhập hoặc phiên đã hết hạn' }, { status: 401, headers });
      }
    }
  }

  return NextResponse.next({ headers });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|uploads|public).*)'],
};
