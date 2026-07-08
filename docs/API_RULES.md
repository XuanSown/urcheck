# API Rules — URCheck

## 1. Location & Naming
- All customer APIs live under `app/api/customer/**` (not `app/api/v1/**`).
- Endpoint files are named by action, e.g. `route.ts`, `[id]/route.ts`.

## 2. Auth & Response Shape
- All customer endpoints must use `requireCustomerApi()` — never bypass.
- All responses are JSON `{ success: boolean, ... }`.
- Errors: `{ success: false, message: string }` + proper HTTP status.
- Success with data: `{ success: true, data }` where `data` matches the resource type.

## 3. Query & Body Conventions
- Pagination: `GET` endpoints accept `page` + `limit` query params.
- Mutations: `POST`/`PUT` body validated for required fields before DB ops.
- No silent failures — all DB exceptions are caught and returned as errors.

## 4. Public Routes
- Public endpoints (`/r/[shareToken]`) are read-only.
- They must NOT return sensitive PII (email/phone) even when available.
