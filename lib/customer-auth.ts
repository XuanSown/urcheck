import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import prisma from './db';
import { SignJWT, jwtVerify as joseJwtVerify } from 'jose';

const CUSTOMER_SESSION_COOKIE = 'customer_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

type CustomerPayload = {
  sub: string;
  email?: string | null;
  role: 'CUSTOMER';
  exp: number;
};

function getSecret() {
  const secret =
    process.env.JWT_SECRET ??
    process.env.ADMIN_SESSION_SECRET ??
    process.env.SECRET_KEY;
  if (!secret) {
    throw new Error('Missing JWT_SECRET / ADMIN_SESSION_SECRET / SECRET_KEY environment variable');
  }
  return new TextEncoder().encode(secret);
}

export async function jwtSign(customer: {
  id: string;
  email?: string | null;
}): Promise<string> {
  return new SignJWT({
    sub: customer.id,
    email: customer.email,
    role: 'CUSTOMER' as const,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function jwtVerify(token: string): Promise<CustomerPayload | null> {
  try {
    const { payload } = await joseJwtVerify(token, getSecret(), {
      algorithms: ['HS256'],
    });
    return payload as CustomerPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function registerCustomer(args: {
  email: string;
  password: string;
  deviceId?: string;
}): Promise<{
  success: boolean;
  customerId?: string;
  token?: string;
  error?: string;
}> {
  const { email, password, deviceId } = args;

  const trimmed = email.trim().toLowerCase();

  const existing = await prisma.customerAccount.findUnique({
    where: { email: trimmed },
  });

  if (existing?.password) {
    return { success: false, error: 'Email này đã được đăng ký' };
  }

  if (existing && !existing.password) {
    return { success: false, error: 'Email này đã tồn tại. Vui lòng đăng nhập hoặc liên hệ hỗ trợ.' };
  }

  const hashedPassword = await hashPassword(password);
  const customerId = crypto.randomUUID();

  const customer = await prisma.customerAccount.create({
    data: {
      id: customerId,
      deviceId: deviceId ?? crypto.randomUUID(),
      email: trimmed,
      password: hashedPassword,
      isVerified: true,
    },
    select: { id: true, email: true },
  });

  await logCustomerAction({
    customerId: customer.id,
    email: customer.email,
    action: 'register',
  });

  const token = await jwtSign(customer);

  return { success: true, customerId: customer.id, token };
}

export async function loginCustomer(args: {
  email: string;
  password: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{
  success: boolean;
  customerId?: string;
  token?: string;
  error?: string;
}> {
  const { email, password, deviceId, ipAddress, userAgent } = args;

  const user = await prisma.customerAccount.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user?.password) {
    await logCustomerAction({
      deviceId,
      email: email.trim().toLowerCase(),
      action: 'login',
      success: false,
      failureReason: 'not_found',
      ipAddress,
      userAgent,
    });
    return { success: false, error: 'Email hoặc mật khẩu không đúng' };
  }

  let valid = false;
  try {
    valid = await bcrypt.compare(password, user.password);
  } catch (error) {
    await logCustomerAction({
      customerId: user.id,
      deviceId,
      email: user.email,
      action: 'login',
      success: false,
      failureReason: 'invalid_password',
      ipAddress,
      userAgent,
    });
    return { success: false, error: 'Đăng nhập thất bại' };
  }

  if (!valid) {
    await logCustomerAction({
      customerId: user.id,
      deviceId,
      email: user.email,
      action: 'login',
      success: false,
      failureReason: 'invalid_password',
      ipAddress,
      userAgent,
    });
    return { success: false, error: 'Email hoặc mật khẩu không đúng' };
  }

  const token = await jwtSign({ id: user.id, email: user.email });

  await logCustomerAction({
    customerId: user.id,
    deviceId,
    email: user.email,
    action: 'login',
    success: true,
    ipAddress,
    userAgent,
  });

  return { success: true, customerId: user.id, token };
}

export async function logoutCustomer(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
}

export async function verifySession(): Promise<{
  customerId: string;
  email?: string | null;
  role: 'CUSTOMER';
} | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CUSTOMER_SESSION_COOKIE);
  if (!cookie?.value) {
    return null;
  }

  const payload = await jwtVerify(cookie.value);
  if (!payload) {
    return null;
  }

  const customer = await prisma.customerAccount.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true },
  });

  if (!customer) {
    return null;
  }

  return {
    customerId: customer.id,
    email: customer.email,
    role: 'CUSTOMER',
  };
}

export async function requireCustomerApi() {
  const session = await verifySession();
  if (!session) {
    const { NextResponse } = await import('next/server');
    return {
      error: NextResponse.json(
        { success: false, error: 'Chưa đăng nhập hoặc phiên đã hết hạn' },
        { status: 401 }
      ),
    } as const;
  }

  return { session } as const;
}

export async function setCustomerSessionCookie(token: string, secure?: boolean): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: CUSTOMER_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: secure ?? (process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production'),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function logCustomerAction(args: {
  customerId?: string | null;
  deviceId?: string | null;
  email?: string | null;
  action: string;
  success?: boolean;
  failureReason?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    await prisma.customerLoginLog.create({
      data: {
        customerId: args.customerId ?? null,
        deviceId: args.deviceId ?? null,
        email: args.email ?? null,
        action: args.action,
        success: args.success ?? true,
        failureReason: args.failureReason ?? null,
        ipAddress: args.ipAddress ?? null,
        userAgent: args.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to write customer login log:', error);
  }
}
