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
  // 1. Look up the user. If the DB itself is unreachable, surface that
  //    explicitly so the operator knows to check DATABASE_URL / network.
  let user;
  try {
    user = await prisma.adminUser.findFirst({
      where: { username, isActive: true },
    });
  } catch (dbError) {
    console.error('Login DB error:', dbError);
    return {
      success: false,
      error: 'Không kết nối được cơ sở dữ liệu. Vui lòng thử lại sau.',
    };
  }

  if (!user) {
    return { success: false, error: 'Tài khoản không tồn tại' };
  }

  // 2. Verify password. Wrap separately so a corrupted hash surfaces as
  //    a clear error instead of the generic catch-all.
  let isValid = false;
  try {
    isValid = await bcrypt.compare(password, user.password);
  } catch (bcryptError) {
    console.error('Bcrypt error during login:', bcryptError);
    return {
      success: false,
      error: 'Mật khẩu trong cơ sở dữ liệu bị lỗi. Liên hệ quản trị viên.',
    };
  }
  if (!isValid) {
    return { success: false, error: 'Mật khẩu không đúng' };
  }

  // 3. Update last login. Failure here is non-fatal — log and continue.
  try {
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
  } catch (updateError) {
    console.warn('Failed to update lastLogin (non-fatal):', updateError);
  }

  // 4. Create session
  const session: AdminSession = {
    userId: user.id,
    username: user.username,
    role: user.role,
    expires: Date.now() + SESSION_MAX_AGE,
  };

  const sessionToken = createSessionToken(session);
  return { success: true, sessionToken };
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
