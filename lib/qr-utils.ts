import { createHash, randomBytes } from 'crypto';
import { getBaseUrl } from './feature-flags';

// ---------------------------------------------------------------------------
// QR code helpers - server side
// ---------------------------------------------------------------------------

/**
 * Generate a short QR code from product name + timestamp.
 * Format: 6 uppercase alphanumeric chars, e.g. "AB12CD".
 * The result is unique enough for product-level QR codes.
 */
export function generateQrCode(productName: string, salt?: string): string {
  const ts = salt || Date.now().toString();
  const hash = createHash('sha256')
    .update(`${productName}::${ts}::${randomBytes(4).toString('hex')}`)
    .digest('hex')
    .toUpperCase();
  // Take first 6 chars, ensure alphanumeric
  return hash.substring(0, 6).replace(/[^A-Z0-9]/g, 'X');
}

/**
 * Build the URL that gets encoded into the QR code image.
 * Default format: {BASE_URL}/?q={CODE}
 */
export function buildQrUrl(code: string, baseUrl?: string): string {
  const base = baseUrl || getBaseUrl();
  return `${base}/?q=${encodeURIComponent(code)}`;
}

/**
 * Auto-generate an order code if admin leaves it blank.
 * Format: ORD-YYMMDD-XXXX (e.g. ORD-260625-A3F2).
 */
export function generateOrderCode(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = createHash('sha256').update(randomBytes(4)).digest('hex').substring(0, 4).toUpperCase();
  return `ORD-${yy}${mm}${dd}-${rand}`;
}

/**
 * Auto-generate a batch code if admin leaves it blank.
 * Format: BATCH-YYMMDD-XXXX.
 */
export function generateBatchCode(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = createHash('sha256').update(randomBytes(4)).digest('hex').substring(0, 4).toUpperCase();
  return `BATCH-${yy}${mm}${dd}-${rand}`;
}

/**
 * Extract a QR code from raw user input.
 * Accepts either a raw code ("AB12CD") or a full URL
 * ("https://urcheck.vercel.app/?q=AB12CD" or "https://urcheck.vercel.app/?q=AB12CD").
 * Returns null if nothing usable is found.
 */
export function extractQrCode(rawInput: string): string | null {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) return null;

  // URL form
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const q = url.searchParams.get('q');
      if (q) {
        // searchParams.get already URL-decodes, so a value like "FF%2011"
        // becomes "FF 11" here. Strip any non-alphanumeric chars that
        // might have slipped in (e.g. spaces, punctuation).
        const cleaned = q.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleaned.length >= 4 && cleaned.length <= 12) return cleaned;
      }
      const m = url.pathname.match(/\/(?:v|verify|q)\/([A-Z0-9]{4,12})/i);
      if (m) return m[1].toUpperCase();
    } catch {
      // fallthrough
    }
  }

  // Raw code
  const code = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length >= 4 && code.length <= 12) return code;
  return null;
}

// ---------------------------------------------------------------------------
// Display helpers - shared between server and client
// ---------------------------------------------------------------------------

/** Convert a centimetre size to PNG pixel size at ~300 DPI for printing. */
export const cmToPixels = (cm: number, dpi = 300): number =>
  Math.round((cm / 2.54) * dpi);

/** Allowed QR label sizes (in cm) for the print/download dialog. */
export const QR_ALLOWED_SIZES_CM = [2, 3, 4] as const;
export type QrLabelSize = (typeof QR_ALLOWED_SIZES_CM)[number];
