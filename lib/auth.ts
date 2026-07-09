import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import prisma from './db';
import { verifyAdminSession, clearAdminSessionCookie } from './session';
import { verifyToken } from './twofactor';

export interface AdminSession {
  userId: string;
  username: string;
  role: string;
}

interface LoginMeta {
  ipAddress?: string;
  userAgent?: string;
  twoFactorToken?: string;
}

// Best-effort audit log — must never break the login flow.
function logAdminLogin(meta: {
  adminUserId?: string;
  username: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}) {
  prisma.adminLoginLog
    .create({
      data: {
        adminUserId: meta.adminUserId,
        username: meta.username,
        success: meta.success,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    })
    .catch((err) => console.warn('Failed to write admin login log (non-fatal):', err));
}

// Login function
export async function loginAdmin(
  username: string,
  password: string,
  meta: LoginMeta = {}
): Promise<{
  success: boolean;
  user?: { id: string; username: string; role: string };
  error?: string;
  twoFactorRequired?: boolean;
}> {
  let user;
  try {
    user = await prisma.adminUser.findFirst({ where: { username, isActive: true } });
  } catch (dbError) {
    console.error('Login DB error:', dbError);
    return { success: false, error: 'Không kết nối được cơ sở dữ liệu. Vui lòng thử lại sau.' };
  }

  if (!user) {
    logAdminLogin({ username, success: false, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
    return { success: false, error: 'Tài khoản không tồn tại' };
  }

  let isValid = false;
  try {
    isValid = await bcrypt.compare(password, user.password);
  } catch (bcryptError) {
    console.error('Bcrypt error during login:', bcryptError);
    return { success: false, error: 'Mật khẩu trong cơ sở dữ liệu bị lỗi. Liên hệ quản trị viên.' };
  }
  if (!isValid) {
    logAdminLogin({ adminUserId: user.id, username, success: false, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
    return { success: false, error: 'Mật khẩu không đúng' };
  }

  // 2FA step (only when enabled)
  if (user.twoFactorEnabled) {
    if (!meta.twoFactorToken) {
      return { success: false, twoFactorRequired: true };
    }
    const ok = verifyToken(user.twoFactorSecret ?? '', meta.twoFactorToken);
    if (!ok) {
      logAdminLogin({ adminUserId: user.id, username, success: false, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
      return { success: false, error: 'Mã xác thực không đúng' };
    }
  }

  try {
    await prisma.adminUser.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  } catch (updateError) {
    console.warn('Failed to update lastLogin (non-fatal):', updateError);
  }

  logAdminLogin({ adminUserId: user.id, username, success: true, ipAddress: meta.ipAddress, userAgent: meta.userAgent });

  return { success: true, user: { id: user.id, username: user.username, role: user.role } };
}

// Logout function
export function logoutAdmin(response: import('next/server').NextResponse): import('next/server').NextResponse {
  return clearAdminSessionCookie(response);
}

// Get current admin user with full details
export async function getCurrentAdmin() {
  const session = await verifyAdminSessionFromCookie();
  if (!session) return null;

  const user = await prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, email: true, role: true, lastLogin: true, createdAt: true, twoFactorEnabled: true },
  });
  return user;
}

// Admin guard for server components
export async function requireAdmin() {
  const session = await verifyAdminSessionFromCookie();
  if (!session) redirect('/admin/login');
  return await getCurrentAdmin();
}

// Admin guard for API route handlers
export async function requireAdminApi(): Promise<
  { user: Awaited<ReturnType<typeof getCurrentAdmin>> } | { error: import('next/server').NextResponse }
> {
  const session = await verifyAdminSessionFromCookie();
  if (!session) {
    const { NextResponse } = await import('next/server');
    return { error: NextResponse.json({ success: false, error: 'Chưa đăng nhập hoặc phiên đã hết hạn' }, { status: 401 }) };
  }
  const user = await getCurrentAdmin();
  if (!user) {
    const { NextResponse } = await import('next/server');
    return { error: NextResponse.json({ success: false, error: 'Không tìm thấy thông tin người dùng' }, { status: 401 }) };
  }
  return { user };
}

async function verifyAdminSessionFromCookie(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  if (!sessionCookie?.value) return null;

  const session = await verifyAdminSession(sessionCookie.value);
  if (!session) return null;

  return { userId: session.userId, username: session.username, role: session.role };
}
