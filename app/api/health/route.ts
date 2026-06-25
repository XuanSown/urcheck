import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * Health check endpoint.
 *
 * - 200 OK: server alive AND database reachable.
 * - 503 Service Unavailable: server alive but database unreachable.
 *
 * Useful for monitoring, Vercel uptime checks, and debugging "why is
 * login failing" by hitting this endpoint first.
 */
export async function GET() {
  const timestamp = new Date().toISOString();

  let dbStatus: 'ok' | 'down' = 'ok';
  let dbError: string | undefined;

  try {
    // Cheap query that doesn't require any tables to exist beyond
    // the built-in Prisma introspection table. Use `SELECT 1` for
    // maximum portability across providers.
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'down';
    dbError = error instanceof Error ? error.message : String(error);
    console.error('[/api/health] DB check failed:', error);
  }

  const body = {
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    timestamp,
    service: 'urcheck API',
    version: '1.0.0',
    database: {
      status: dbStatus,
      ...(dbError ? { error: dbError } : {}),
    },
  };

  return NextResponse.json(body, {
    status: dbStatus === 'ok' ? 200 : 503,
    headers: {
      // Health checks should never be cached.
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
