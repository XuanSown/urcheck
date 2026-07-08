# Database Rules — URCheck

## 1. Schema Conventions
- Table names are **snake_case** (`customer_badges`, `scan_logs`), mapped via `@@map`.
- Column names are **camelCase** in Prisma, snake_case in SQL.
- Foreign keys: named `{field}Id` (e.g. `productId`, `routineId`).
- All relations must define `onDelete` behavior (usually `Cascade`).

## 2. Indexing
- Index foreign keys (`@@index([customerId])`).
- Index composite high-traffic queries (e.g. `[customerId, alertDate]`).
- Use `@unique` for natural keys (`email`, `deviceId`, `shareToken`).

## 3. Migrations
- Always use `prisma migrate dev --name` for local changes.
- Use `CUID()` for public-facing IDs; `@default(now())` for timestamps.
- `soft delete` pattern: add `deletedAt` field instead of hard delete.

## 4. Sensitive Data
- Never store raw passwords — use bcrypt via `customer-auth.ts`.
- No API keys or tokens in schema comments or seed data.
