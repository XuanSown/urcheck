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
    verify_input_label: 'Mã QR hoặc URL',
    verify_input_placeholder: 'VD: AB12CD hoặc https://urcheck.vercel.app/?q=AB12CD',
    verify_camera_btn: 'Quét bằng camera',
    verify_button: 'Xác minh',
    verify_error: 'Lỗi',
    verify_loading: 'Đang xác minh...',
    verify_invalid_code: 'Mã QR không hợp lệ hoặc không tồn tại trong hệ thống',
    verify_qr_disabled: 'Tính năng xác minh QR đang được tắt',
    verify_another: 'Xác minh sản phẩm khác',
    verify_valid: 'Sản phẩm hợp lệ',
    verify_expired: 'Sản phẩm đã hết hạn sử dụng',
    verify_unverified: 'Sản phẩm chưa được xác minh',
    verify_conn_error: 'Lỗi kết nối, vui lòng thử lại',
    // Admin - QR dialog
    qr_dialog_title: 'Mã QR đã được tạo',
    qr_dialog_subtitle: 'Dán mã QR này lên sản phẩm để khách hàng quét và xác minh',
    qr_dialog_download: 'Tải QR',
    qr_dialog_print: 'In QR',
    qr_dialog_size_label: 'Kích thước nhãn',
    qr_dialog_size_unit: 'cm',
    qr_dialog_code_label: 'Mã QR',
    qr_dialog_url_label: 'URL xác minh',
    qr_dialog_close: 'Đóng',
    // Footer
    footer_desc: 'Nền tảng xác minh nguồn gốc sản phẩm mỹ phẩm bằng công nghệ mã QR — nhanh chóng, chính xác và miễn phí.',
    footer_tag_1: 'Quét QR',
    footer_tag_2: 'Xác minh tức thì',
    footer_tag_3: 'Miễn phí',
    footer_contact: 'Liên hệ',
    footer_rights: 'Bảo lưu mọi quyền.',
    footer_status: 'Hệ thống đang hoạt động',
    footer_dev_by: 'Phát triển tại',
    // Dashboard
    dashboard_title: 'Dashboard',
    dashboard_top_qr: 'Mã QR được quét nhiều nhất',
    dashboard_total_qr: 'Tổng mã QR',
    dashboard_total_scans: 'Tổng lượt quét',
    dashboard_no_data: 'Chưa có dữ liệu',
    // Navigation
    nav_how_it_works: 'Cách hoạt động',
    nav_support: 'Hỗ trợ',
    nav_contact: 'Liên hệ',
    // Hero
    hero_headline_1: 'Kiểm tra nguồn gốc',
    hero_headline_2: 'sản phẩm mỹ phẩm',
    hero_subtitle: 'Quét mã QR để xác minh tính hợp lệ, ngày sản xuất, hạn sử dụng và thông tin nhà sản xuất.',
    hero_subtitle_highlight: ' Nhanh chóng, miễn phí, không cần đăng ký.',
    hero_cta: 'Quét mã QR ngay',
    hero_trust_1: 'Không cần đăng ký',
    hero_trust_2: 'Quét nhanh 2s',
    hero_trust_3: '100% miễn phí',
    // Product Info
    product_unknown_date: 'Không xác định',
    product_status_authentic: 'Sản phẩm chính hãng',
    product_status_expired: 'Sản phẩm hết hạn',
    product_status_invalid: 'Sản phẩm không hợp lệ',
    product_mfg_date: 'Ngày sản xuất',
    product_exp_date: 'Hạn sử dụng',
    product_skin_type: 'Loại da',
    product_suitable_for: 'Đối tượng',
    product_usages: 'Công dụng',
    product_usage_instructions: 'Hướng dẫn sử dụng',
    product_ingredients: 'Thành phần nổi bật',
    product_buy_at: 'Mua sản phẩm chính hãng tại',
    // QR Scanner
    qr_scanner_title: 'Quét mã QR',
    qr_scanner_subtitle: 'Đưa mã QR vào khung hình để xác minh',
    qr_scanner_close: 'Đóng',
    qr_scanner_choose_method: 'Chọn phương thức quét mã QR',
    qr_scanner_open_camera: 'Mở camera',
    qr_scanner_upload_image: 'Upload ảnh',
    qr_scanner_processing: 'Đang xử lý ảnh...',
    qr_scanner_stop_camera: 'Dừng camera',
    qr_scanner_cancel: 'Hủy',
    qr_scanner_err_no_cam_perm: 'Bạn chưa cấp quyền camera. Nhấn vào biểu tượng ổ khóa 🔒 trên thanh địa chỉ trình duyệt để Cho phép (Allow).',
    qr_scanner_err_no_cam: 'Không tìm thấy camera trên thiết bị của bạn.',
    qr_scanner_err_cam_in_use: 'Camera đang được sử dụng bởi một ứng dụng khác (Zalo, Meet, Zoom...).',
    qr_scanner_err_cam_fail: 'Không thể mở camera. Vui lòng kiểm tra lại kết nối thiết bị.',
    qr_scanner_err_no_qr_found: 'Không tìm thấy mã QR hợp lệ trong ảnh',
    qr_scanner_err_generic: 'Không thể truy cập camera. Vui lòng cấp quyền!',
    // Common
    common_language: 'Ngôn ngữ',
  },
  en: {
    verify_title: 'Verify product authenticity',
    verify_subtitle: 'Enter the QR code or URL from the product packaging',
    verify_input_label: 'QR code or URL',
    verify_input_placeholder: 'E.g. AB12CD or https://urcheck.vercel.app/?q=AB12CD',
    verify_camera_btn: 'Scan with camera',
    verify_button: 'Verify',
    verify_error: 'Error',
    verify_loading: 'Verifying...',
    verify_invalid_code: 'QR code is invalid or not found in our system',
    verify_qr_disabled: 'QR verification is currently disabled',
    verify_another: 'Verify another product',
    verify_valid: 'Product is valid',
    verify_expired: 'Product has expired',
    verify_unverified: 'Product is not verified',
    verify_conn_error: 'Connection error, please try again',
    qr_dialog_title: 'QR code generated',
    qr_dialog_subtitle: 'Print and stick this QR on your product packaging',
    qr_dialog_download: 'Download QR',
    qr_dialog_print: 'Print QR',
    qr_dialog_size_label: 'Label size',
    qr_dialog_size_unit: 'cm',
    qr_dialog_code_label: 'QR code',
    qr_dialog_url_label: 'Verify URL',
    qr_dialog_close: 'Close',
    dashboard_title: 'Dashboard',
    dashboard_top_qr: 'Top scanned QR codes',
    dashboard_total_qr: 'Total QR codes',
    // Footer
    footer_desc: 'Cosmetic product authenticity verification platform using QR code technology — fast, accurate, and free.',
    footer_tag_1: 'QR Scan',
    footer_tag_2: 'Instant verify',
    footer_tag_3: 'Free',
    footer_contact: 'Contact',
    footer_rights: 'All rights reserved.',
    footer_status: 'All systems operational',
    footer_dev_by: 'Developed in',
    dashboard_total_scans: 'Total scans',
    dashboard_no_data: 'No data yet',
    // Navigation
    nav_how_it_works: 'How it works',
    nav_support: 'Support',
    nav_contact: 'Contact',
    // Hero
    hero_headline_1: 'Verify authenticity',
    hero_headline_2: 'of cosmetic products',
    hero_subtitle: 'Scan the QR code to verify validity, manufacturing date, expiration date, and manufacturer info.',
    hero_subtitle_highlight: ' Fast, free, no registration required.',
    hero_cta: 'Scan QR code now',
    hero_trust_1: 'No registration required',
    hero_trust_2: 'Fast 2s scan',
    hero_trust_3: '100% Free',
    // Product Info
    product_unknown_date: 'Unknown',
    product_status_authentic: 'Authentic Product',
    product_status_expired: 'Expired Product',
    product_status_invalid: 'Invalid Product',
    product_mfg_date: 'Mfg Date',
    product_exp_date: 'Exp Date',
    product_skin_type: 'Skin Type',
    product_suitable_for: 'Suitable For',
    product_usages: 'Usages',
    product_usage_instructions: 'Instructions',
    product_ingredients: 'Key Ingredients',
    product_buy_at: 'Buy authentic product at',
    // QR Scanner
    qr_scanner_title: 'Scan QR Code',
    qr_scanner_subtitle: 'Point your camera at the QR code to verify',
    qr_scanner_close: 'Close',
    qr_scanner_choose_method: 'Choose scan method',
    qr_scanner_open_camera: 'Open camera',
    qr_scanner_upload_image: 'Upload image',
    qr_scanner_processing: 'Processing image...',
    qr_scanner_stop_camera: 'Stop camera',
    qr_scanner_cancel: 'Cancel',
    qr_scanner_err_no_cam_perm: 'Camera permission denied. Please click the lock 🔒 icon in the address bar to allow.',
    qr_scanner_err_no_cam: 'No camera found on your device.',
    qr_scanner_err_cam_in_use: 'Camera is currently in use by another application.',
    qr_scanner_err_cam_fail: 'Could not start camera. Please check your device connection.',
    qr_scanner_err_no_qr_found: 'No valid QR code found in the image.',
    qr_scanner_err_generic: 'Cannot access camera. Please grant permission!',
    // Common
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
