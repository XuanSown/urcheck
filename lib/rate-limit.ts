import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ponytail: Upstash keys required at call time, not import time, so build/SSR doesn't crash without env.
let redis: Redis | null = null;
let limiters: Record<'login' | 'register' | 'otp', Ratelimit> | null = null;

function getLimiters() {
  if (limiters) return limiters;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required');
  }
  redis = new Redis({ url, token });
  // ponytail: windows fixed to match customer login/register usage; change here if policy changes.
  limiters = {
    login: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '15 m'), analytics: false }),
    register: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '60 m'), analytics: false }),
    otp: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '15 m'), analytics: false }),
  };
  return limiters;
}

export interface RateLimitResult {
  limited: boolean;
  retryAfterSec: number;
}

// Atomically checks AND consumes one attempt. Returns whether the request is limited.
export async function checkRateLimit(
  scope: 'login' | 'register' | 'otp',
  key: string
): Promise<RateLimitResult> {
  const { success, reset } = await getLimiters()[scope].limit(key);
  if (!success) {
    return { limited: true, retryAfterSec: Math.max(0, Math.ceil((reset - Date.now()) / 1000)) };
  }
  return { limited: false, retryAfterSec: 0 };
}
