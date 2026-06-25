// Lightweight i18n for the QR verification flow and admin.
// Locales: vi (default) and en.
// Usage:
//   import { useLocale, t } from '@/lib/i18n';
//   const { locale, setLocale, t } = useLocale();
//   <h1>{t('verify_title')}</h1>

export type Locale = 'vi' | 'en';

export const LOCALES: Locale[] = ['vi', 'en'];
export const DEFAULT_LOCALE: Locale = 'vi';
export const LOCALE_LABELS: Record<Locale, string> = { vi: 'Tiếng Việt', en: 'English' };

// ---------------------------------------------------------------------------
// Dictionary
// ---------------------------------------------------------------------------
type Dict = Record<string, string>;

const dicts: Record<Locale, Dict> = {
  vi: {
    // Verify page
    verify_title: 'Xác minh nguồn gốc sản phẩm',
    verify_subtitle: 'Nhập mã QR hoặc URL từ bao bì sản phẩm',
    verify_input_placeholder: 'VD: AB12CD hoặc https://urcheck.vercel.app/?q=AB12CD',
    verify_button: 'Xác minh',
    verify_loading: 'Đang xác minh...',
    verify_invalid_code: 'Mã QR không hợp lệ hoặc không tồn tại trong hệ thống',
    verify_qr_disabled: 'Tính năng xác minh QR đang được tắt',
    verify_another: 'Xác minh sản phẩm khác',
    verify_valid: 'Sản phẩm hợp lệ',
    verify_expired: 'Sản phẩm đã hết hạn sử dụng',
    verify_unverified: 'Sản phẩm chưa được xác minh',
    // Admin - QR dialog
    qr_dialog_title: 'Mã QR đã được tạo',
    qr_dialog_subtitle: 'Dán mã QR này lên sản phẩm để khách hàng quét và xác minh',
    qr_dialog_download: 'Tải QR',
    qr_dialog_print: 'In QR',
    qr_dialog_size_label: 'Kích thước nhãn',
    qr_dialog_size_unit: 'cm',
    qr_dialog_code_label: 'Mã QR',
    qr_dialog_url_label: 'URL xác minh',
    qr_dialog_order_label: 'Mã đơn hàng',
    qr_dialog_batch_label: 'Mã lô',
    qr_dialog_close: 'Đóng',
    // Product form
    form_order_code: 'Mã đơn hàng',
    form_order_code_hint: 'Để trống = tự động tạo',
    form_batch_code: 'Mã lô',
    form_batch_code_hint: 'Để trống = tự động tạo',
    // Dashboard
    dashboard_title: 'Dashboard',
    dashboard_top_qr: 'Mã QR được quét nhiều nhất',
    dashboard_total_qr: 'Tổng mã QR',
    dashboard_total_scans: 'Tổng lượt quét',
    dashboard_no_data: 'Chưa có dữ liệu',
    // Common
    common_language: 'Ngôn ngữ',
  },
  en: {
    verify_title: 'Verify product authenticity',
    verify_subtitle: 'Enter the QR code or URL from the product packaging',
    verify_input_placeholder: 'E.g. AB12CD or https://urcheck.vercel.app/?q=AB12CD',
    verify_button: 'Verify',
    verify_loading: 'Verifying...',
    verify_invalid_code: 'QR code is invalid or not found in our system',
    verify_qr_disabled: 'QR verification is currently disabled',
    verify_another: 'Verify another product',
    verify_valid: 'Product is valid',
    verify_expired: 'Product has expired',
    verify_unverified: 'Product is not verified',
    qr_dialog_title: 'QR code generated',
    qr_dialog_subtitle: 'Print and stick this QR on your product packaging',
    qr_dialog_download: 'Download QR',
    qr_dialog_print: 'Print QR',
    qr_dialog_size_label: 'Label size',
    qr_dialog_size_unit: 'cm',
    qr_dialog_code_label: 'QR code',
    qr_dialog_url_label: 'Verify URL',
    qr_dialog_order_label: 'Order code',
    qr_dialog_batch_label: 'Batch code',
    qr_dialog_close: 'Close',
    form_order_code: 'Order code',
    form_order_code_hint: 'Leave empty = auto-generated',
    form_batch_code: 'Batch code',
    form_batch_code_hint: 'Leave empty = auto-generated',
    dashboard_title: 'Dashboard',
    dashboard_top_qr: 'Top scanned QR codes',
    dashboard_total_qr: 'Total QR codes',
    dashboard_total_scans: 'Total scans',
    dashboard_no_data: 'No data yet',
    common_language: 'Language',
  },
};

/** Resolve a translation key with optional fallback locale and default text. */
export function translate(
  locale: Locale,
  key: string,
  fallback?: string
): string {
  return dicts[locale]?.[key] ?? dicts[DEFAULT_LOCALE][key] ?? fallback ?? key;
}

// ---------------------------------------------------------------------------
// Locale persistence (client side)
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'urcheck.locale';
const COOKIE_KEY = 'urcheck_locale';

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value);
}

export function readLocaleFromClient(defaultLocale: Locale = DEFAULT_LOCALE): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch { /* ignore */ }
  return defaultLocale;
}

export function writeLocaleToClient(locale: Locale): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
    // Also set cookie so server components can read it on next nav.
    document.cookie = `${COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  } catch { /* ignore */ }
}

/** Read locale on the server (from cookie set by the client). */
export function readLocaleFromCookies(
  cookieValue: string | undefined,
  defaultLocale: Locale = DEFAULT_LOCALE
): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  return defaultLocale;
}
