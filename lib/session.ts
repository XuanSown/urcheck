import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import { getAdminSecret } from './secrets';
import prisma from './db';

export interface AdminSession {
  userId: string;
  username: string;
  role: string;
  deviceFingerprint?: string;
  expires?: number;
  tokenVersion?: number;
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
    const { payload } = await jwtVerify(token, getAdminSecret(), { algorithms: ['HS256'] });
    const p = payload as unknown as Record<string, unknown>;
    return {
      userId: p.userId as string,
      username: p.username as string,
      role: p.role as string,
      deviceFingerprint: p.deviceFingerprint as string | undefined,
      expires: typeof p.exp === 'number' ? p.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000,
      tokenVersion: typeof p.tokenVersion === 'number' ? p.tokenVersion : 0,
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
