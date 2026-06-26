import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Build a Prisma client that works correctly with PgBouncer / Supabase
 * Transaction pooler in serverless environments.
 *
 * The two key tweaks:
 *  1. `?pgbouncer=true&connection_limit=1` is appended to the database
 *     URL by the deploy step (see DATABASE_SETUP.md). Prisma sees the
 *     `pgbouncer=true` flag and disables prepared-statement caching,
 *     which is what causes the "prepared statement \"sN\" does not
 *     exist" error when Vercel reuses / rotates connections.
 *  2. The client is cached on `globalThis` in non-production to avoid
 *     exhausting connections during HMR. In production (Vercel) we
 *     intentionally do NOT cache, because each cold-start gets a
 *     fresh runtime.
 */
function makePrisma(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['query', 'error', 'warn'],
  });
}

export const prisma: PrismaClient = (() => {
  if (process.env.NODE_ENV === 'production') {
    // Serverless: do not reuse a stale instance across invocations.
    return makePrisma();
  }
  // Dev: cache to avoid leaking connections during HMR.
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = makePrisma();
  }
  return globalForPrisma.prisma;
})();

export default prisma;
