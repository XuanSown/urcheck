// Feature flags for legacy/new feature toggling.
// Use env vars to enable/disable features WITHOUT touching code.
// After modifying env vars, restart the dev server.

/**
 * Toggle the new QR code pipeline.
 * Default: true (QR is the active feature).
 * Set ENABLE_QR=false in .env to disable.
 */
export const isQrEnabled = (): boolean => {
  // Default ON unless explicitly disabled
  return process.env.ENABLE_QR !== 'false';
};

/**
 * Base URL used when building the URL that gets encoded into the QR code.
 * Production: https://urcheck.vercel.app
 * Development: http://localhost:3000 (auto fallback)
 */
export const getBaseUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, ''); // strip trailing slash
};
