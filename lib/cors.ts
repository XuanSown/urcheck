/**
 * Strict CORS policy for Next.js Route Handlers.
 *
 * - Exact-match origin checking (no wildcards, no "*")
 * - Comma-separated env var `ALLOWED_ORIGINS`, defaults to localhost:3000 & localhost:3001
 * - Named exports only — import what you need.
 *
 * This is intentionally more restrictive than the legacy helpers in security.ts.
 */

/* ------------------------------------------------------------------ */
/* 1. Allowed origins                                                  */
/* ------------------------------------------------------------------ */

/** Default origins used when ALLOWED_ORIGINS is not set. */
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

/**
 * Read allowed origins from the ALLOWED_ORIGINS env var.
 * The value is a comma-separated list; surrounding whitespace is stripped.
 * Falls back to DEFAULT_ALLOWED_ORIGINS when the env var is absent or empty.
 */
export function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw || raw.trim().length === 0) {
    return [...DEFAULT_ALLOWED_ORIGINS];
  }
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}

/* ------------------------------------------------------------------ */
/* 2. Origin validation                                                */
/* ------------------------------------------------------------------ */

/**
 * Pre-computed set of allowed origins for O(1) lookups.
 * Re-built via `refreshOrigins()` when needed (e.g. tests).
 */
let _originSet: Set<string> | null = null;

/** Rebuild the internal origin set from ALLOWED_ORIGINS (or defaults). */
export function refreshOrigins(): void {
  _originSet = new Set(getAllowedOrigins());
}

/** Return the cached origin set, building it on first call. */
function getOriginSet(): Set<string> {
  if (!_originSet) {
    refreshOrigins();
  }
  return _originSet!;
}

/**
 * Strict origin check — exact match only.
 *
 * No wildcards, no `*`, no suffix matching.
 * An empty or non-string origin always returns false.
 */
export function isOriginAllowed(origin: string | null | undefined): boolean {
  if (typeof origin !== 'string' || origin.length === 0) {
    return false;
  }
  return getOriginSet().has(origin);
}

/* ------------------------------------------------------------------ */
/* 3. CORS response headers                                            */
/* ------------------------------------------------------------------ */

/**
 * Build CORS response headers for an already-validated origin.
 *
 * Only call this after confirming the origin passes `isOriginAllowed()`.
 */
export function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/* ------------------------------------------------------------------ */
/* 4. Preflight response                                               */
/* ------------------------------------------------------------------ */

import { NextResponse } from 'next/server';

/**
 * Return a 204 No Content response for OPTIONS preflight requests,
 * with CORS headers attached for the given origin.
 *
 * Returns `null` when the origin is not allowed — caller should fall
 * back to `handleOrigin()` which returns a 403.
 */
export function preflightResponse(origin: string): NextResponse | null {
  if (!isOriginAllowed(origin)) {
    return null;
  }
  return NextResponse.json(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

/* ------------------------------------------------------------------ */
/* 5. Origin gate helper                                               */
/* ------------------------------------------------------------------ */

/**
 * Extract the `Origin` header from a Request and validate it.
 *
 * - If valid: returns `null` (request may proceed).
 * - If missing or not allowed: returns a NextResponse 403 with an
 *   empty allow-origin header (no leakage to the client).
 *
 * Usage in a Route Handler:
 *   export async function OPTIONS(request: Request) {
 *     const origin = request.headers.get('origin') ?? '';
 *     const blocked = handleOrigin(request);
 *     if (blocked) return blocked;
 *     return preflightResponse(origin);
 *   }
 *
 *   export async function GET(request: Request) {
 *     const blocked = handleOrigin(request);
 *     if (blocked) return blocked;
 *     // … normal handler logic …
 *   }
 */
export function handleOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');

  if (!isOriginAllowed(origin)) {
    // Empty allow-origin so the browser blocks the response body.
    return new NextResponse(null, {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '',
      },
    });
  }

  return null;
}
