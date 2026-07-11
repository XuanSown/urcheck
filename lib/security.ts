/**
 * Centralized security utilities for Next.js 16 + TypeScript.
 * - CORS helpers
 * - Security headers
 * - Input sanitization & prototype-pollution protection
 *
 * This file is side-effect free. Import and call explicitly.
 */

/* ------------------------------------------------------------------ */
/*  1. CORS helpers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Read allowed origins from env var ALLOWED_ORIGINS (comma-separated).
 * Strips surrounding whitespace from each entry.
 */
export function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) {
    return ['http://localhost:3000', 'http://localhost:3001'];
  }
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}

/**
 * CORS response headers for a given origin.
 * Only call this after confirming the origin is allowed via isOriginAllowed().
 */
export function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Strict origin check — supports wildcard subdomains via `*` suffix match on the hostname,
 * e.g. `https://*.example.com` matches `https://app.example.com`.
 */
export function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;

  const allowed = getAllowedOrigins();

  // Exact match
  if (allowed.includes(origin)) return true;

  // Wildcard hostname match (e.g. https://*.example.com)
  try {
    const url = new URL(origin);
    for (const pattern of allowed) {
      if (pattern.includes('*')) {
        const escaped = pattern.replace(/\./g, '\\.').replace(/\*/g, '[^.]+');
        const regex = new RegExp(`^${escaped}$`);
        if (regex.test(url.origin)) return true;
      }
    }
  } catch {
    // Not a valid URL — skip wildcard check
  }

  return false;
}

/** Build a CORS middleware handler for Next.js Route Handlers. */
export function buildCorsMiddleware(
  allowedOrigins?: string[],
): (origin: string) => Record<string, string> {
  const origins = new Set(allowedOrigins ?? getAllowedOrigins());

  return (origin: string): Record<string, string> => {
    if (!isOriginAllowed(origin) || !origins.has(origin)) {
      // Return empty headers — caller should short-circuit with 403/empty allow-origin
      return {};
    }
    return corsHeaders(origin);
  };
}

/* ------------------------------------------------------------------ */
/*  2. Security headers                                                */
/* ------------------------------------------------------------------ */

export function securityHeaders(): Record<string, string> {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: http: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  const headers: Record<string, string> = {
    'Content-Security-Policy': csp,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  // HSTS only in production
  if (process.env.NODE_ENV === 'production') {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }

  return headers;
}

/* ------------------------------------------------------------------ */
/*  3. Input sanitisation                                              */
/* ------------------------------------------------------------------ */

/**
 * Remove control characters (U+0000–U+001F and U+007F except \n, \r, \t)
 * and trim to maxLength. Straight pass-through for outside-printable range.
 */
export function sanitizeString(input: string, maxLength = 10_000): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, maxLength);
}

/**
 * Escape HTML special chars so the result is safe to insert as innerHTML.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Keys that could be used for prototype-pollution attacks */
const POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Recursively remove prototype-pollution keys from plain objects.
 * Non-plain-objects (Date, RegExp, class instances) are returned as-is.
 */
export function sanitizeForPrisma(input: unknown): unknown {
  if (input === null || typeof input !== 'object') return input;

  // Arrays — sanitize each element
  if (Array.isArray(input)) {
    return input.map(sanitizeForPrisma);
  }

  // Use Object(instance) to allow both plain objects and class instances
  const keys = Reflect.ownKeys(input as Record<string, unknown>);

  for (const key of keys) {
    if (POLLUTION_KEYS.has(String(key))) {
      delete (input as Record<string, unknown>)[String(key)];
      continue;
    }

    const value = (input as Record<string, unknown>)[String(key)];
    if (value && typeof value === 'object') {
      sanitizeForPrisma(value);
    }
  }

  return input;
}

/* ------------------------------------------------------------------ */
/*  4. Miscellaneous                                                   */
/* ------------------------------------------------------------------ */

/**
 * Generate a URL-safe random token for CSRF, invite codes, etc.
 * Uses Node's built-in crypto.randomBytes — no external dependency.
 *
 * Default 32 bytes → 64 hex chars.
 */
export async function generateToken(bytes = 32): Promise<string> {
  try {
    // Next.js Edge / Vercel runtimes may not have 'crypto' module;
    // the Web Crypto API is always available in those contexts.
    if (typeof globalThis !== 'undefined' && 'crypto' in globalThis) {
      const arr = new Uint8Array(bytes);
      globalThis.crypto.getRandomValues(arr);
      return Buffer.from(arr).toString('hex');
    }

    // Deno / Bun / Node
    const mod = await import('node:crypto');
    return mod.randomBytes(bytes).toString('hex');
  } catch {
    // Last resort (still fine for non-security tokens); prefer real CSPRNG above.
    return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}