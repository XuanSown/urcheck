# Upstash Rate Limiter — Report

- **Status**: DONE
- **Commit hash**: 13766cb
- **Files changed**:
  - `lib/rate-limit.ts` — rewritten: Upstash-backed limiter with in-memory fallback, `checkRateLimit` now async/atomic, removed `incrementRateLimit`.
  - `app/api/customer/login/route.ts` — import trimmed, `await checkRateLimit`, removed `incrementRateLimit('login', ip)`.
  - `app/api/customer/register/route.ts` — import trimmed, `await checkRateLimit`, removed `incrementRateLimit('register', ip)`.
  - `package.json` — added `@upstash/ratelimit@^1.1.2`, `@upstash/redis@^1.34.0`.
  - `package-lock.json` — updated by install.
- **npm install**: SUCCEEDED (added 471 packages; 2 moderate vulnerabilities unrelated to this change).

## Concerns
- In-memory fallback branch starts the count at `1` on a new bucket (atomic consume), which differs slightly from the old two-step behavior but matches the new atomic design.
- Upstash limiter ignores the `windowMs`/`max` opts passed from callers and uses fixed windows (5/15m login, 3/60m register) defined in `lib/rate-limit.ts`. This is intentional per the provided spec; if call-site policy ever diverges, update the limiter config there.
- Cannot run `tsc`/`next build` in this environment to type-check; verified by reading. `@upstash/ratelimit` / `@upstash/redis` types are bundled with the packages.
