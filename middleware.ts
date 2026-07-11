import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getCustomerSecret, getAdminSecret } from './lib/secrets';

export const config = {
  matcher: ['/api/customer/:path*', '/api/admin/:path*', '/admin/:path*'],
};

const CUSTOMER_PUBLIC = [
  '/api/customer/login',
  '/api/customer/register',
  '/api/customer/logout',
  '/api/customer/verify',
];

function isCustomerPublic(pathname: string): boolean {
  if (CUSTOMER_PUBLIC.includes(pathname)) return true;
  return (
    pathname.startsWith('/api/customer/forgot-password') ||
    pathname.startsWith('/api/customer/reset-password')
  );
}

function isAdminPublic(pathname: string): boolean {
  if (pathname === '/api/admin/login') return true;
  if (pathname === '/api/admin/verify') return true;
  if (pathname === '/api/admin/logout') return true;
  return pathname.startsWith('/api/admin/forgot-password');
}

async function verifyJwt(token: string, secret: Uint8Array): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/customer')) {
    if (isCustomerPublic(pathname)) {
      return NextResponse.next();
    }
    const token = request.cookies.get('customer_session')?.value ?? '';
    if (!(await verifyJwt(token, getCustomerSecret()))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/admin')) {
    if (isAdminPublic(pathname)) {
      return NextResponse.next();
    }
    const token = request.cookies.get('admin_session')?.value ?? '';
    if (!(await verifyJwt(token, getAdminSecret()))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    const token = request.cookies.get('admin_session')?.value ?? '';
    if (!(await verifyJwt(token, getAdminSecret()))) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}