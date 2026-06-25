'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { isBarcodeEnabled } from '@/lib/feature-flags';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

type ScanMode = 'camera' | 'upload' | 'idle';

export function BarcodeScanner({ onScanSuccess, onScanError }: BarcodeScannerProps) {
  // Hide the entire scanner if the legacy barcode feature is disabled.
  // We still keep this component intact (do not delete) so it can be
  // re-enabled by flipping ENABLE_BARCODE=true in .env.
  if (!isBarcodeEnabled()) {
    return null;
  }

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState<ScanMode>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setMode('camera');

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (mediaError: any) {
        console.error("Camera Permission Error:", mediaError);
        if (mediaError.name === 'NotAllowedError') {
          throw new Error('Bạn chưa cấp quyền camera. Vui lòng nhấn vào biểu tượng ổ khóa 🔒 trên thanh địa chỉ trình duyệt để Cho phép (Allow).');
        } else if (mediaError.name === 'NotFoundError') {
          throw new Error('Không tìm thấy camera trên thiết bị của bạn.');
        } else if (mediaError.name === 'NotReadableError') {
          throw new Error('Camera đang được sử dụng bởi một ứng dụng khác (Zalo, Meet, Zoom...).');
        } else {
          throw new Error('Không thể mở camera. Bạn hãy kiểm tra lại kết nối thiết bị.');
        }
      }

      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch (e) {}
        scannerRef.current.clear();
      }

      scannerRef.current = new Html5Qrcode('barcode-reader');

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 300, height: 150 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanner();
        },
        (decodeError) => {
          // Ignore scan errors
        }
      );

      setIsScanning(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể truy cập camera. Vui lòng cấp quyền!';
      setError(errorMessage);
      onScanError?.(errorMessage);
      setMode('idle');
    }
  }, [onScanSuccess, onScanError]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(() => {});
      } catch {
        // Ignore errors
      }
    }
    setIsScanning(false);
    setMode('idle');
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(null);
      setMode('upload');

      const html5QrCode = new Html5Qrcode('barcode-scanner-container');

      html5QrCode
        .scanFile(file, true)
        .then((decodedText) => {
          onScanSuccess(decodedText);
          setMode('idle');
        })
        .catch((err) => {
          const errorMessage = 'Không tìm thấy mã QR hợp lệ trong ảnh';
          setError(errorMessage);
          onScanError?.(errorMessage);
          setMode('idle');
        });
    },
    [onScanSuccess, onScanError]
  );

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        id="barcode-scanner-container"
        className={cn(
          'relative overflow-hidden rounded-2xl bg-gray-900 shadow-2xl',
          mode === 'camera' ? 'aspect-square' : 'aspect-square min-h-[250px] sm:min-h-[300px]'
        )}
      >
        <AnimatePresence mode="wait">
          {mode === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 sm:p-8"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <svg className="w-16 h-16 sm:w-20 sm:h-20 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <rect x="2" y="4" width="20" height="16" rx="1" />
                  <line x1="5" y1="8" x2="5" y2="16" />
                  <line x1="7" y1="8" x2="7" y2="16" />
                  <line x1="9" y1="8" x2="9" y2="16" strokeWidth={2} />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="14" y1="8" x2="14" y2="16" strokeWidth={2} />
                  <line x1="16" y1="8" x2="16" y2="16" />
                  <line x1="19" y1="8" x2="19" y2="16" />
                </svg>
              </motion.div>
              <p className="text-center text-xs sm:text-sm opacity-70 max-w-[200px] sm:max-w-none">
                Nhấn &quot;Mở camera&quot; để bắt đầu quét mã QR
              </p>
            </motion.div>
          )}

          {(mode === 'camera' || mode === 'upload') && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <div id="barcode-reader" className="h-full w-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay frame for camera mode */}
        {mode === 'camera' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-6 sm:inset-8 border-2 border-white/20 rounded-2xl transition-all duration-300" />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 sm:w-72 sm:h-32 border-2 border-primary-500 rounded-lg"
              animate={{
                boxShadow: ['0 0 20px rgba(234, 88, 12, 0.3)', '0 0 40px rgba(234, 88, 12, 0.6)', '0 0 20px rgba(234, 88, 12, 0.3)'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Scan line */}
            <motion.div
              className="absolute top-[15%] bottom-[15%] w-0.5 bg-gradient-to-b from-transparent via-primary-500 to-transparent"
              animate={{ left: ['15%', '85%', '15%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Corner accents */}
            <div className="absolute top-6 left-6 sm:top-8 sm:left-8 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-l-2 border-primary-500" />
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-r-2 border-primary-500" />
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-l-2 border-primary-500" />
            <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-r-2 border-primary-500" />
          </div>
        )}

        {/* Loading overlay */}
        {mode === 'upload' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-red-600 text-white p-3 sm:p-4"
          >
            <p className="text-center text-xs sm:text-sm">{error}</p>
          </motion.div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Control buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6 justify-center">
        {!isScanning ? (
          <Button
            onClick={startCamera}
            size="lg"
            className="w-full sm:w-auto shadow-lg hover:shadow-xl hover:shadow-primary-500/20 transform hover:scale-[1.03] active:scale-95 transition-all duration-300 group"
          >
            <motion.svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </motion.svg>
            <span>Mở camera</span>
          </Button>
        ) : (
          <Button
            onClick={stopScanner}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto hover:scale-[1.03] active:scale-95 transition-all duration-300"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
            <span>Dừng camera</span>
          </Button>
        )}

        <Button
          onClick={triggerFileUpload}
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto hover:scale-[1.03] active:scale-95 transition-all duration-300"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Upload ảnh mã QR</span>
        </Button>
      </div>
    </div>
  );
}
