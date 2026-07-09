/**
 * Centralized security utilities for Next.js 16 + TypeScript.
 * - Rate limiting (sliding window, in-memory)
 * - CORS helpers
 * - Security headers
 * - Input sanitization & prototype-pollution protection
 *
 * This file is side-effect free. Import and call explicitly.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

export interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  keySuffix?: string;
  limits?: Record<string, { windowMs: number; max: number }>;
}

interface Bucket {
  count: number;
  resetTime: number;
}

/* ------------------------------------------------------------------ */
/*  1. RateLimiter — sliding-window (in-memory Map)                    */
/* ------------------------------------------------------------------ */

export class RateLimiter {
  private readonly windowMs: number;
  private readonly max: number;
  private readonly keySuffix: string;
  private readonly presetLimits: Record<string, { windowMs: number; max: number }>;
  private readonly store: Map<string, Bucket>;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  // Preset endpoints (suffix key used after current keySuffix)
  private static readonly PRESET_LIMITS = {
    'admin:login': { windowMs: 15 * 60 * 1000, max: 5 },
    'customer:login': { windowMs: 15 * 60 * 1000, max: 5 },
    'admin:forgot': { windowMs: 15 * 60 * 1000, max: 3 },
  } as const;

  constructor(options: RateLimiterOptions = {}) {
    this.windowMs = options.windowMs ?? 60_000;
    this.max = options.max ?? 100;
    this.keySuffix = options.keySuffix ?? '';
    this.presetLimits = options.limits ?? { ...RateLimiter.PRESET_LIMITS };
    this.store = new Map();

    // Periodic cleanup of expired buckets (every 2 minutes)
    this.cleanupTimer = setInterval(() => this.purgeExpired(), 2 * 60_000);
    // Don't block process exit
    if (typeof globalThis !== 'undefined') {
      // Node domain or similar is not needed for plain setInterval
    }
  }

  /**
   * Extract client IP from common reverse-proxy headers.
   * x-forwarded-for may contain a comma-separated list; the first entry is the original client.
   */
  private extractIp(request: Request): string {
    const headers = request.headers;

    const candidates: string[] = [
      headers.get('x-forwarded-for')?.split(',')[0].trim(),
      headers.get('cf-connecting-ip'),
      headers.get('x-real-ip'),
    ].filter((v): v is string => typeof v === 'string' && v.length > 0);

    // Fallback — will be the same for all requests without proxy headers;
    // production MUST sit behind a reverse proxy.
    const ip = candidates[0] ?? 'unknown';

    return `${ip}${this.keySuffix ? `:${this.keySuffix}` : ''}`;
  }

  /**
   * Return the effective (windowMs, max) for a given preset key or the default.
   */
  private resolveLimits(endpoint?: string): { windowMs: number; max: number } {
    if (endpoint && endpoint in this.presetLimits) {
      return this.presetLimits[endpoint];
    }
    return { windowMs: this.windowMs, max: this.max };
  }

  /**
   * Check rate limit for the incoming request.
   * Preset endpoints: 'admin:login', 'customer:login' — pass via `endpoint`.
   */
  async check(request: Request, endpoint?: string): Promise<RateLimitResult> {
    const key = this.extractIp(request);
    const { windowMs, max } = this.resolveLimits(endpoint);
    const now = Date.now();
    const bucketKey = `${key}:${endpoint ?? ''}`;

    const bucket = this.store.get(bucketKey);

    if (!bucket || now >= bucket.resetTime) {
      // New window (or expired)
      const newBucket: Bucket = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.store.set(bucketKey, newBucket);
      return { allowed: true };
    }

    // Still in window
    if (bucket.count >= max) {
      const retryAfter = Math.ceil((bucket.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    bucket.count += 1;
    return { allowed: true };
  }

  /** Remove buckets whose window has expired. */
  private purgeExpired(): void {
    const now = Date.now();
    for (const [k, v] of Array.from(this.store)) {
      if (now >= v.resetTime) {
        this.store.delete(k);
      }
    }
  }

  /** Stop the cleanup timer. Call on shutdown / tests. */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.store.clear();
  }
}

// Singleton instance — reasonable defaults: 100 req / minute
export const defaultRateLimiter = new RateLimiter();

/* ------------------------------------------------------------------ */
/*  2. CORS helpers                                                    */
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
/*  3. Security headers                                                */
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
/*  4. Input sanitisation                                              */
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
/*  5. Miscellaneous                                                   */
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
