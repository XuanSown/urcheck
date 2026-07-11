'use client';

import { useRef, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { useLocale } from '@/components/I18nProvider';
import {
  QR_ALLOWED_SIZES_CM,
  type QrLabelSize,
} from '@/lib/qr-utils';

interface QrCodeDialogProps {
  open: boolean;
  onClose: () => void;
  code: string;
  url: string;
  productName: string;
  logoUrl?: string;
}

// Internal pixel size for the hidden canvas. High DPI for crisp PNG output.
const RENDER_PX = 1024;

export function QrCodeDialog({
  open,
  onClose,
  code,
  url,
  productName,
  logoUrl = '/images/logo-main.png',
}: QrCodeDialogProps) {
  const { t } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sizeCm, setSizeCm] = useState<QrLabelSize>(2);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  // Logo overlay fraction of QR (keep ≤20% for H-level correction readability)
  const logoFraction = 0.18;
  const logoPx = Math.round(RENDER_PX * logoFraction);
  const previewSize = 160;
  const previewLogoPx = Math.round(previewSize * logoFraction);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png', 1)
      );
      if (!blob) throw new Error('Canvas toBlob returned null');
      const safeName = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `qr-${safeName || code}-${sizeCm}cm.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download QR failed:', err);
      alert('Tải QR thất bại, vui lòng thử lại');
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = () => {
    setBusy(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const win = window.open('', '_blank', 'width=800,height=900');
      if (!win) {
        alert('Trình duyệt đang chặn popup. Vui lòng cho phép popup để in.');
        return;
      }
      const sizeMm = sizeCm * 10;
      win.document.write(`<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<title>In QR - ${escapeHtml(productName)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 24px;
    font-family: ui-sans-serif, system-ui, sans-serif;
    color: #111;
    background: #fff;
  }
  .label {
    display: inline-block;
    border: 1px dashed #d4d4d4;
    padding: 12px;
    text-align: center;
  }
  .qr {
    width: ${sizeMm}mm;
    height: ${sizeMm}mm;
    background-image: url('${dataUrl}');
    background-size: contain;
    background-repeat: no-repeat;
  }
  .meta { margin-top: 8px; font-size: 10pt; line-height: 1.4; }
  .code { font-family: ui-monospace, monospace; font-weight: 700; }
  .row { display: flex; justify-content: space-between; gap: 8px; }
  @media print {
    body { padding: 0; }
    .label { border: none; padding: 0; }
  }
</style>
</head>
<body>
  <div class="label">
    <div class="qr" id="qr-img"></div>
    <div class="meta">
      <div><strong>${escapeHtml(productName)}</strong></div>
      <div class="row"><span>${escapeHtml(t('qr_dialog_code_label'))}:</span><span class="code">${escapeHtml(code)}</span></div>
    </div>
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 200);
    });
  </script>
</body>
</html>`);
      win.document.close();
    } catch (err) {
      console.error('Print QR failed:', err);
      alert('In QR thất bại, vui lòng thử lại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimateOverlay>
      <Card className="w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 pt-6 pb-8 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 mb-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">
            {t('qr_dialog_title')}
          </h2>
          <p className="text-sm text-white/70 mt-1">
            {productName}
          </p>
        </div>

        {/* QR Preview - centered, compact */}
        <div className="px-6 mt-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 flex flex-col items-center">
            {/* Visible SVG preview - compact size */}
            <QRCodeSVG
              value={url}
              size={previewSize}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: logoUrl,
                height: previewLogoPx,
                width: previewLogoPx,
                excavate: true,
              }}
            />
            {/* Code badge */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">{t('qr_dialog_code_label')}:</span>
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-md">{code}</span>
            </div>
          </div>
        </div>

        {/* Hidden canvas for high-res PNG export */}
        <div className="absolute -left-[9999px] top-0" aria-hidden="true">
          <QRCodeCanvas
            ref={canvasRef}
            value={url}
            size={RENDER_PX}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin
            imageSettings={{
              src: logoUrl,
              height: logoPx,
              width: logoPx,
              excavate: true,
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-6 pt-4 pb-6 space-y-4">
          {/* Size picker */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {t('qr_dialog_size_label')}
            </label>
            <div className="flex gap-2">
              {QR_ALLOWED_SIZES_CM.map((cm) => (
                <button
                  key={cm}
                  type="button"
                  onClick={() => setSizeCm(cm)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                    sizeCm === cm
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-primary-500 dark:border-primary-600 shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {cm} {t('qr_dialog_size_unit')}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons - Download & Print */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100 disabled:opacity-50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <span className="text-sm font-semibold">Download QR</span>
              <span className="text-[10px] text-primary-500 font-medium">PNG • {sizeCm}cm</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={busy}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-700 dark:bg-gray-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
              <span className="text-sm font-semibold">In QR</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{sizeCm}cm × {sizeCm}cm</span>
            </button>
          </div>

          {/* Guide text */}
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Chọn kích thước rồi bấm Download hoặc In mã QR
          </p>

          {/* Close button */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline underline-offset-2"
            >
              {t('qr_dialog_close')}
            </button>
          </div>
        </div>
      </Card>
    </AnimateOverlay>
  );
}

function AnimateOverlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
        className="w-full max-w-sm"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
