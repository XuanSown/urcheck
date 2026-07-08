# Code Rules — URCheck

## 1. Language & Style
- Code comments and user-facing messages must be in **Vietnamese (vi)**.
- UI copy only translates via `t()` calls — never hardcode Vietnamese or English strings in JSX.
- Code comments and identifiers are in **English**.

## 2. Component & File Patterns
- Components are **PascalCase** (e.g. `CustomerHistoryList.tsx`) and placed in `components/`.
- Route handlers and utilities are **camelCase** in `lib/`, **PascalCase** in `app/`.
- Keep component max-length imports under control — no direct deep imports from other `app/` routes.

## 3. State & Data Fetching
- Use **server actions / route handlers** for data mutations.
- Use **React hooks** (`useState`, `useEffect`) for client-side state.
- API responses are wrapped `{ success, data }` or `{ success, message }`.

## 4. Error Handling
- Wrap async calls in `try/catch`.
- UI errors are surfaced via toast or inline alert, never `console.error` only.
- API errors return proper HTTP status codes (400/401/403/404/500).
