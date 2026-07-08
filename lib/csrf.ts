import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const csrfStore = new Map<string, { userId: string; expires: number }>();

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function isExpired(expires: number): boolean {
  return Date.now() > expires;
}

export async function generateCsrfToken(): Promise<string> {
  try {
    const token = generateToken();
    const expires = Date.now() + 2 * 60 * 60 * 1000;
    csrfStore.set(token, { userId: '', expires });
    return token;
  } catch {
    return '';
  }
}

export async function verifyCsrfToken(token: string, userId: string): Promise<boolean> {
  try {
    if (!token || !userId) return false;
    const entry = csrfStore.get(token);
    if (!entry) return false;
    if (isExpired(entry.expires)) {
      csrfStore.delete(token);
      return false;
    }
    if (entry.userId !== userId) return false;
    csrfStore.delete(token);
    return true;
  } catch {
    return false;
  }
}

export async function rotateCsrfToken(oldToken: string, userId: string): Promise<string | null> {
  try {
    if (!oldToken || !userId) return null;
    const entry = csrfStore.get(oldToken);
    if (!entry || isExpired(entry.expires) || entry.userId !== userId) return null;
    csrfStore.delete(oldToken);
    const newToken = generateToken();
    const expires = Date.now() + 2 * 60 * 60 * 1000;
    csrfStore.set(newToken, { userId, expires });
    return newToken;
  } catch {
    return null;
  }
}

export async function csrfProtect(
  request: Request,
  userId?: string,
): Promise<{ passed: boolean; error?: NextResponse }> {
  try {
    const method = request.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return { passed: true };
    }

    const headerToken = request.headers.get('x-csrf-token');
    if (!headerToken) {
      return {
        passed: false,
        error: NextResponse.json({ error: 'Missing CSRF token' }, { status: 403 }),
      };
    }

    const resolvedUserId = userId ?? (await cookies()).get('customer_session')?.value ?? '';

    if (!resolvedUserId) {
      return {
        passed: false,
        error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      };
    }

    const valid = await verifyCsrfToken(headerToken, resolvedUserId);
    if (!valid) {
      return {
        passed: false,
        error: NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 }),
      };
    }

    return { passed: true };
  } catch {
    return {
      passed: false,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
}
