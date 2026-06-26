import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/admin/login', '/admin/logout'];
const adminRoutes = ['/admin'];

// Helper to check if a path matches any route pattern
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => path === route || path.startsWith(route + '/'));
}

function isAdminRoute(path: string): boolean {
  return adminRoutes.some(route => path === route || path.startsWith(route + '/'));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('admin_session');
  const hasSession = sessionCookie && sessionCookie.value;

  // If it's a public route, allow access
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // If it's an admin route, require authentication
  if (isAdminRoute(path)) {
    if (!hasSession) {
      // Not authenticated, redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    // Verify session is valid (optional: add more validation here)
    try {
      const sessionData = JSON.parse(atob(sessionCookie.value));
      // Check if session is expired
      if (sessionData.expires && sessionData.expires < Date.now()) {
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('admin_session');
        return response;
      }
    } catch {
      // Invalid session, clear and redirect
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match admin routes (including the bare /admin root).
    '/admin',
    '/admin/:path*',
  ],
};
