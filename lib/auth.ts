import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';
import prisma from './db';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface AdminSession {
  userId: string;
  username: string;
  role: string;
  expires: number;
}

// Helper to create session cookie value
function createSessionToken(session: AdminSession): string {
  return btoa(JSON.stringify(session));
}

// Helper to decode and verify session
export async function verifySession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session: AdminSession = JSON.parse(atob(sessionCookie.value));

    // Check expiration
    if (session.expires < Date.now()) {
      return null;
    }

    // Verify user still exists and is active
    const user = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Login function
export async function loginAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
  try {
    // Find user
    const user = await prisma.adminUser.findFirst({
      where: { username, isActive: true },
    });

    if (!user) {
      return { success: false, error: 'Tài khoản không tồn tại' };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: 'Mật khẩu không đúng' };
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create session
    const session: AdminSession = {
      userId: user.id,
      username: user.username,
      role: user.role,
      expires: Date.now() + SESSION_MAX_AGE,
    };

    const sessionToken = createSessionToken(session);

    // Set cookie (use Next.js Response cookies in API route)
    return { success: true, sessionToken };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Đã xảy ra lỗi, vui lòng thử lại' };
  }
}

// Logout function
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Get current admin user with full details
export async function getCurrentAdmin() {
  const session = await verifySession();
  if (!session) return null;

  const user = await prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  return user;
}

// Admin guard for server components.
// Returns the current admin user or redirects to /admin/login.
export async function requireAdmin() {
  const session = await verifySession();
  if (!session) {
    redirect('/admin/login');
  }
  return await getCurrentAdmin();
}

// Admin guard for API route handlers.
// Returns { user } on success or { error } containing a NextResponse on
// failure. Callers should `if ('error' in result) return result.error;`.
export async function requireAdminApi(): Promise<
  { user: Awaited<ReturnType<typeof getCurrentAdmin>> } | { error: import('next/server').NextResponse }
> {
  const session = await verifySession();
  if (!session) {
    const { NextResponse } = await import('next/server');
    return {
      error: NextResponse.json(
        { success: false, error: 'Chưa đăng nhập hoặc phiên đã hết hạn' },
        { status: 401 }
      ),
    };
  }
  const user = await getCurrentAdmin();
  if (!user) {
    const { NextResponse } = await import('next/server');
    return {
      error: NextResponse.json(
        { success: false, error: 'Không tìm thấy thông tin người dùng' },
        { status: 401 }
      ),
    };
  }
  return { user };
}
