/**
 * Minimal TOTP (Time-based One-Time Password) for admin 2FA.
 *
 * Algorithm (MVP, RFC 6238 simplified):
 *   counter = floor(now / 30s)
 *   hmac    = HMAC-SHA1(secret, counter)   // secret is hex-decoded
 *   code    = dynamic truncation -> 6-digit decimal
 *
 * No external dependency — uses Node's built-in crypto.
 * `secret` is stored hex-encoded; `otpauthUri` builds a standard
 * otpauth:// URI usable by Google Authenticator / Authy.
 */

import crypto from 'crypto';

const STEP_SECONDS = 30;
const DIGITS = 6;

export function generateSecret(): string {
  return crypto.randomBytes(20).toString('hex');
}

export function verifyToken(secret: string, token: string): boolean {
  const clean = token.replace(/\s/g, '');
  if (!/^\d{6}$/.test(clean)) return false;

  const counter = Math.floor(Date.now() / 1000 / STEP_SECONDS);
  // Allow current and previous step to tolerate clock drift.
  for (const c of [counter - 1, counter]) {
    if (hotp(secret, c) === clean) return true;
  }
  return false;
}

function hotp(secretHex: string, counter: number): string {
  const key = Buffer.from(secretHex, 'hex');
  const buf = Buffer.alloc(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = c & 0xff;
    c = Math.floor(c / 256);
  }

  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (bin % 10 ** DIGITS).toString().padStart(DIGITS, '0');
}

// ponytail: base32 encoding for otpauth URI compatibility with authenticator apps
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function secretToBase32(secretHex: string): string {
  const bytes = Buffer.from(secretHex, 'hex');
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += BASE32[(value << (5 - bits)) & 31];
  }
  return out;
}

export function otpauthUri(secretHex: string, account: string, issuer = 'urcheck'): string {
  const secret = secretToBase32(secretHex);
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
