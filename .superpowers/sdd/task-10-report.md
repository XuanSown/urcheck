# Task 10 Report — Edge Middleware Auth Guard

## Status
COMPLETED

## Commit hash (7 chars)
e2678d0

## Files changed
- `middleware.ts` (new) — root edge middleware guarding `/api/customer/*` and `/api/admin/*`

`app/proxy.ts` was NOT deleted: the file does not exist in this worktree (grep confirmed it is absent; the only `proxy` references are `lib/security.ts` comments and an unreferenced `proxy` function description). No cleanup required.

## Admin auth method (findings)
Investigated `app/api/admin/*`:
- `app/api/admin/verify/route.ts` reads the `admin_session` cookie via `cookieStore.get('admin_session')` and validates with `verifyAdminSession` (from `lib/session.ts`).
- `app/api/admin/login/route.ts` sets the `admin_session` cookie on success.
- No `Authorization: Bearer` header usage anywhere in admin routes (only the cookie).

Conclusion: admin routes authenticate exclusively via the `admin_session` cookie (HS256, secret `ADMIN_SESSION_SECRET ?? SECRET_KEY`). The middleware therefore requires the `admin_session` cookie and returns 401 when missing/invalid. No Bearer header path was added since none exists.

Customer routes authenticate via the `customer_session` cookie (HS256, secret `JWT_SECRET ?? ADMIN_SESSION_SECRET ?? SECRET_KEY`), mirrored in the middleware.

## Verification
- Imports are self-contained for the EDGE runtime: only `next/server` and `jose`. No `lib/customer-auth`, `lib/session`, `lib/auth`, node:crypto, or db deps.
- `config.matcher` covers both `/api/customer/:path*` and `/api/admin/:path*`.
- Public paths skipped: customer → login, register, logout, forgot-password, reset-password; admin → login, forgot-password.
- Non-public requests without a valid token receive `401 { success:false, error:'Unauthorized' }`.
