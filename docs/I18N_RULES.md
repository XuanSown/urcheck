# i18n Rules — URCheck

## 1. Key Structure
- Keys live in `lib/i18n.ts` under the `translations` object.
- Group keys by domain: `auth_*`, `badges_*`, `history_*`, `routines_*`, etc.
- Use snake_case for key names.

## 2. Usage
- Always call `const { t } = useLocale()` and use `t('key')`.
- Never concatenate translated strings — use placeholders supported by i18n.
- Pass optional `defaultValue` when key might be missing in one locale.

## 3. New Keys Protocol
- When adding a new feature, add vi + en entries for every new key.
- Run `npm run lint` or verify no `t('...')` calls reference missing keys.
