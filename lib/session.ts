import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

export interface AdminSession {
  userId: string;
  username: string;
  role: string;
  deviceFingerprint?: string;
  expires?: number;
}

export interface CustomerSession {
  customerId: string;
  deviceId: string;
  email?: string;
}

function getAdminSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.ADMIN_SESSION_SECRET ?? process.env.SECRET_KEY ?? 'fallback-secret-change-me'
  );
}

function getCustomerSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? process.env.SECRET_KEY ?? 'fallback-secret-change-me'
  );
}

export async function signAdminSession(session: AdminSession): Promise<string> {
  try {
    const jwt = await new SignJWT({ ...session })
      .setProtectedHeader({ typ: 'JWT', alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(getAdminSecret());
    return jwt;
  } catch {
    return '';
  }
}

export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getAdminSecret());
    const p = payload as unknown as Record<string, unknown>;
    return {
      userId: p.userId as string,
      username: p.username as string,
      role: p.role as string,
      deviceFingerprint: p.deviceFingerprint as string | undefined,
      expires: typeof p.exp === 'number' ? p.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
  } catch {
    return null;
  }
}

export async function signCustomerSession(session: CustomerSession): Promise<string> {
  try {
    const jwt = await new SignJWT({ ...session })
      .setProtectedHeader({ typ: 'JWT', alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(getCustomerSecret());
    return jwt;
  } catch {
    return '';
  }
}

export async function verifyCustomerSession(token: string): Promise<CustomerSession | null> {
  try {
    const { payload } = await jwtVerify(token, getCustomerSecret());
    const p = payload as unknown as Record<string, unknown>;
    return {
      customerId: p.customerId as string,
      deviceId: p.deviceId as string,
      email: p.email as string | undefined,
    };
  } catch {
    return null;
  }
}

export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
};

export function getCookieOptions(type: 'admin' | 'customer' = 'admin'): CookieOptions {
  const maxAgeMap = { admin: 7 * 24 * 60 * 60, customer: 30 * 24 * 60 * 60 };
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMap[type],
  };
}

export function setAdminSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('admin_session', token, getCookieOptions('admin'));
  return response;
}

export function setCustomerSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('customer_session', token, getCookieOptions('customer'));
  return response;
}

export function clearAdminSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete('admin_session');
  return response;
}

export function clearCustomerSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete('customer_session');
  return response;
}
