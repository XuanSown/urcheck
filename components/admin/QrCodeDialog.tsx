'use client';

import { useRef, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useLocale } from '@/components/I18nProvider';
import {
  QR_ALLOWED_SIZES_CM,
  cmToPixels,
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

// Internal pixel size for the canvas. We render at high DPI so the PNG
// stays sharp even when admin picks a 4cm label.
const RENDER_PX = 1024;

export function QrCodeDialog({
  open,
  onClose,
  code,
  url,
  productName,
  logoUrl = '/logo-qr.svg',
}: QrCodeDialogProps) {
  const { t } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sizeCm, setSizeCm] = useState<QrLabelSize>(2);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  // Logo overlay size as a fraction of the QR canvas. Keeps logo from
  // covering too much of the QR even with high error correction (H = 30%).
  const logoFraction = 0.18;
  const logoPx = Math.round(RENDER_PX * logoFraction);

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
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${safeName || code}-${sizeCm}cm.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
      <Card className="w-full max-w-md bg-white">
        <div className="p-6 space-y-5">
          <header className="text-center space-y-1">
            <h2 className="text-xl font-bold text-gray-900">
              {t('qr_dialog_title')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('qr_dialog_subtitle')}
            </p>
          </header>

          {/* Hidden canvas used to generate PNG download / print. */}
          <div className="flex justify-center bg-gray-50 p-4 rounded-xl border border-gray-200">
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

          {/* Smaller preview SVG so the dialog isn't dominated by 1024px. */}
          <div className="flex justify-center -mt-2">
            <QRCodeSVG
              value={url}
              size={120}
              level="H"
              includeMargin
              imageSettings={{
                src: logoUrl,
                height: Math.round(120 * logoFraction),
                width: Math.round(120 * logoFraction),
                excavate: true,
              }}
            />
          </div>

          {/* Meta */}
          <div className="text-sm space-y-2 bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">{t('qr_dialog_code_label')}:</span>
              <span className="font-mono font-bold text-gray-900">{code}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">URL:</span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-primary-600 hover:underline truncate max-w-[260px]"
              >
                {url}
              </a>
            </div>

          </div>

          {/* Size picker */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-700">
              {t('qr_dialog_size_label')}:
            </span>
            <div className="flex gap-1">
              {QR_ALLOWED_SIZES_CM.map((cm) => (
                <button
                  key={cm}
                  type="button"
                  onClick={() => setSizeCm(cm)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    sizeCm === cm
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cm} {t('qr_dialog_size_unit')}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownload}
              loading={busy}
              disabled={busy}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('qr_dialog_download')} ({sizeCm}cm)
            </Button>
            <Button
              type="button"
              onClick={handlePrint}
              loading={busy}
              disabled={busy}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t('qr_dialog_print')} ({sizeCm}cm)
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
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
        className="w-full max-w-md"
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
