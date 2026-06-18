'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

type ScanMode = 'camera' | 'upload' | 'idle';

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState<ScanMode>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setMode('camera');

    // Cần 1 khoảng chờ nhỏ để DOM kịp render div "qr-reader" nếu nó bị ẩn
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // 1. Xin quyền truy cập camera chủ động trước khi khởi tạo bộ quét
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Tắt stream ngay vì mình chỉ cần trình duyệt hiện popup xin quyền
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

      // 2. Sau khi đã có quyền, khởi tạo Html5Qrcode
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch (e) {}
        scannerRef.current.clear();
      }

      scannerRef.current = new Html5Qrcode('qr-reader');

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanner();
        },
        (decodeError) => {
          // Ignore scan errors - it's normal when no QR is visible
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

      const html5QrCode = new Html5Qrcode('qr-scanner-container');

      html5QrCode
        .scanFile(file, true)
        .then((decodedText) => {
          onScanSuccess(decodedText);
          setMode('idle');
        })
        .catch((err) => {
          const errorMessage = 'Không tìm thấy QR code hợp lệ trong ảnh';
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        id="qr-scanner-container"
        className={cn(
          'relative overflow-hidden rounded-2xl bg-gray-900',
          mode === 'camera' ? 'aspect-square' : 'aspect-square min-h-[300px]'
        )}
      >
        <AnimatePresence mode="wait">
          {mode === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-white p-8"
            >
              <svg
                className="w-20 h-20 mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              <p className="text-center text-sm">Nhấn "Mở camera" để bắt đầu quét QR code</p>
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
              {/* QR Scanner iframe/container */}
              <div id="qr-reader" className="h-full w-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay frame for camera mode */}
        {mode === 'camera' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-white/30 rounded-2xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-accent-gold rounded-lg" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-full bg-accent-gold/20" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-0.5 w-full bg-accent-gold/20" />
          </div>
        )}

        {/* Loading overlay */}
        {mode === 'upload' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-4"
          >
            <p className="text-center text-sm">{error}</p>
          </motion.div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Control buttons */}
      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        {!isScanning ? (
          <Button onClick={startCamera} size="lg" className="shadow-lg">
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
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Mở camera
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="outline" size="lg">
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
            Dừng camera
          </Button>
        )}

        <Button onClick={triggerFileUpload} variant="secondary" size="lg">
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
          Upload ảnh QR
        </Button>
      </div>
    </div>
  );
}
