# Project Rules — URCheck

## 1. Auth & Customer Identity
- Customer identity must come from a verified session, never from raw deviceId alone.
- Do not allow protected actions without `requireCustomerApi()` guard.
- Any code that mentions USB/logging automatically implies an OAuth login flow — implement it.

## 2. Trust Boundaries
- Treat the "parent" USB trust/sync flow as untrusted input by default.
- A customer is not authorized to read or modify another customer's routines.
