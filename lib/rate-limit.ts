import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type Bucket = { count: number; resetTime: number };

const stores: Record<'login' | 'register', Map<string, Bucket>> = {
  login: new Map(),
  register: new Map(),
};

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const upstashEnabled = Boolean(upstashUrl && upstashToken);

// ponytail: Upstash limiter is shared across all serverless instances (real rate limiting).
// Falls back to in-memory (single-instance only) when env vars are absent (local dev).
let upstashLimiters: Record<'login' | 'register', Ratelimit> | null = null;
if (upstashEnabled) {
  const redis = new Redis({ url: upstashUrl!, token: upstashToken! });
  // ponytail: windows fixed to match customer login/register usage; change here if policy changes.
  upstashLimiters = {
    login: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '15 m'), analytics: false }),
    register: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '60 m'), analytics: false }),
  };
}

export interface RateLimitResult {
  limited: boolean;
  retryAfterSec: number;
}

// Atomically checks AND consumes one attempt. Returns whether the request is limited.
export async function checkRateLimit(
  scope: 'login' | 'register',
  key: string,
  opts: { windowMs: number; max: number }
): Promise<RateLimitResult> {
  if (upstashEnabled && upstashLimiters) {
    const { success, reset } = await upstashLimiters[scope].limit(key);
    if (!success) {
      return { limited: true, retryAfterSec: Math.max(0, Math.ceil((reset - Date.now()) / 1000)) };
    }
    return { limited: false, retryAfterSec: 0 };
  }

  const store = stores[scope];
  const now = Date.now();
  for (const [k, v] of Array.from(store)) {
    if (now >= v.resetTime) store.delete(k);
  }
  const fullKey = `${scope}:${key}`;
  const bucket = store.get(fullKey);
  if (bucket && bucket.count >= opts.max && now < bucket.resetTime) {
    return { limited: true, retryAfterSec: Math.ceil((bucket.resetTime - now) / 1000) };
  }
  if (!bucket || now >= bucket.resetTime) {
    store.set(fullKey, { count: 1, resetTime: now + opts.windowMs });
  } else {
    bucket.count += 1;
  }
  return { limited: false, retryAfterSec: 0 };
}
