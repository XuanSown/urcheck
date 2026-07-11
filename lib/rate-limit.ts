// ponytail: in-memory, single-instance limiter. On serverless (multiple instances) this does NOT share
// state, so it only limits within one instance's lifetime. For cross-instance limiting, swap the store
// for Upstash Redis (@upstash/ratelimit) reading UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.
type Bucket = { count: number; resetTime: number };

const stores: Record<'login' | 'register', Map<string, Bucket>> = {
  login: new Map(),
  register: new Map(),
};

export interface RateLimitResult {
  limited: boolean;
  retryAfterSec: number;
}

export function checkRateLimit(
  scope: 'login' | 'register',
  key: string,
  opts: { windowMs: number; max: number }
): RateLimitResult {
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
    store.set(fullKey, { count: 0, resetTime: now + opts.windowMs });
  }
  return { limited: false, retryAfterSec: 0 };
}

export function incrementRateLimit(scope: 'login' | 'register', key: string): void {
  const bucket = stores[scope].get(`${scope}:${key}`);
  if (bucket) bucket.count += 1;
}
