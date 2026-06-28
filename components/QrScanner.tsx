'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/I18nProvider';

interface QrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called with the decoded QR string.
   * Implementations are responsible for closing the dialog after handling.
   */
  onScanSuccess: (decodedText: string) => void;
}

type ScanMode = 'camera' | 'upload' | 'idle';

/**
 * QR scanner dialog for the public verify flow (replaces the legacy
 * barcode scanner, which was hidden behind ENABLE_BARCODE).
 *
 * Supports:
 *   - Camera scanning (getUserMedia + html5-qrcode)
 *   - Image upload scan (jpg/png with embedded QR)
 *
 * Notes:
 *   - Camera requires HTTPS in production. localhost is OK.
 *   - Browsers may require explicit user permission. The camera button
 *     requests the stream on click, not on mount.
 *   - This scanner is intentionally NOT gated by ENABLE_BARCODE — it is
 *     the active flow for QR verification.
 */
export function QrScanner({ isOpen, onClose, onScanSuccess }: QrScannerProps) {
  const { t } = useLocale();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [mode, setMode] = useState<ScanMode>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state every time the dialog re-opens.
  useEffect(() => {
    if (isOpen) {
      setMode('idle');
      setError(null);
    }
  }, [isOpen]);

  // Always stop the camera when the dialog closes or unmounts.
  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(() => {
          // Ignore: scanner may not have been started.
        });
      } catch {
        // Ignore.
      }
    }
    setIsScanning(false);
    setMode('idle');
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setMode('camera');

    // Yield one frame so the <div id="qr-public-reader"> is in the DOM.
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Probe the camera permission early so we can show a clear message.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (mediaError: any) {
        if (mediaError?.name === 'NotAllowedError') {
          throw new Error(t('qr_scanner_err_no_cam_perm'));
        } else if (mediaError?.name === 'NotFoundError') {
          throw new Error(t('qr_scanner_err_no_cam'));
        } else if (mediaError?.name === 'NotReadableError') {
          throw new Error(t('qr_scanner_err_cam_in_use'));
        } else {
          throw new Error(t('qr_scanner_err_cam_fail'));
        }
      }

      // Clean up any previous instance.
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch { /* ignore */ }
        try { scannerRef.current.clear(); } catch { /* ignore */ }
      }

      const instance = new Html5Qrcode('qr-public-reader');
      scannerRef.current = instance;

      await instance.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // First successful decode — stop and bubble up.
          stopScanner();
          onScanSuccess(decodedText);
        },
        () => {
          // Per-frame decode failures are normal; ignore.
        }
      );

      setIsScanning(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('qr_scanner_err_generic');
      setError(message);
      setMode('idle');
    }
  }, [onScanSuccess, stopScanner, t]);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(null);
      setMode('upload');

      try {
        const instance = new Html5Qrcode('qr-public-reader');
        const decoded = await instance.scanFile(file, true);
        onScanSuccess(decoded);
        setMode('idle');
      } catch {
        setError(t('qr_scanner_err_no_qr_found'));
        setMode('idle');
      } finally {
        // Reset the input so the same file can be re-selected.
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [onScanSuccess]
  );

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => {
          stopScanner();
          onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('qr_scanner_title')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('qr_scanner_subtitle')}</p>
            </div>
            <button
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label={t('qr_scanner_close')}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scanner area */}
          <div className="relative">
            <div
              id="qr-public-reader"
              className={cn(
                'w-full bg-gray-900',
                mode === 'camera' ? 'block' : 'hidden'
              )}
              style={{ minHeight: '320px' }}
            />

            {mode === 'idle' && (
              <div
                className="h-[320px] flex flex-col items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)' }}
              >
                <div className="text-center p-6">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h3v3h-3z" />
                    <path d="M20 14v3M14 20h3" strokeLinecap="round" />
                  </svg>
                  <p className="text-gray-400 mb-6">{t('qr_scanner_choose_method')}</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={startCamera} size="lg">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 001.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t('qr_scanner_open_camera')}
                    </Button>
                    <Button variant="secondary" onClick={triggerFileUpload} size="lg">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t('qr_scanner_upload_image')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {mode === 'upload' && (
              <div className="h-[320px] flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-400 mt-4">{t('qr_scanner_processing')}</p>
                </div>
              </div>
            )}

            {/* Scan overlay (corner brackets + scanning line) */}
            {mode === 'camera' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-white/20 rounded-2xl" />
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-primary-500 rounded-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(234, 88, 12, 0.3)',
                      '0 0 40px rgba(234, 88, 12, 0.6)',
                      '0 0 20px rgba(234, 88, 12, 0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute top-[20%] bottom-[20%] w-0.5 bg-gradient-to-b from-transparent via-primary-500 to-transparent"
                  animate={{ left: ['22%', '78%', '22%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Corner accents */}
                <div className="absolute top-8 left-8 w-5 h-5 border-t-2 border-l-2 border-primary-500" />
                <div className="absolute top-8 right-8 w-5 h-5 border-t-2 border-r-2 border-primary-500" />
                <div className="absolute bottom-8 left-8 w-5 h-5 border-b-2 border-l-2 border-primary-500" />
                <div className="absolute bottom-8 right-8 w-5 h-5 border-b-2 border-r-2 border-primary-500" />
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white p-3 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                stopScanner();
                onClose();
              }}
            >
              {t('qr_scanner_cancel')}
            </Button>
            {mode === 'camera' && (
              <Button variant="outline" onClick={stopScanner}>
                {t('qr_scanner_stop_camera')}
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
