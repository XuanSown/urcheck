'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface BarcodeScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
  existingBarcodes: string[];
}

export default function BarcodeScannerDialog({
  isOpen,
  onClose,
  onBarcodeDetected,
  existingBarcodes,
}: BarcodeScannerDialogProps) {
  const [mode, setMode] = useState<'idle' | 'camera' | 'upload'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('idle');
      setError(null);
    }
  }, [isOpen]);

  const startCamera = useCallback(async () => {
    setError(null);
    setMode('camera');

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Check camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (mediaError: any) {
        if (mediaError.name === 'NotAllowedError') {
          throw new Error('Bạn chưa cấp quyền camera. Vui lòng nhấn "Allow" trên trình duyệt.');
        } else if (mediaError.name === 'NotFoundError') {
          throw new Error('Không tìm thấy camera trên thiết bị.');
        } else {
          throw new Error('Không thể mở camera. Kiểm tra thiết bị của bạn.');
        }
      }

      // Dynamic import html5-qrcode
      const { Html5Qrcode } = await import('html5-qrcode');

      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch (e) {}
        scannerRef.current.clear();
      }

      scannerRef.current = new Html5Qrcode('scanner-reader');

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 120 },
          aspectRatio: 1.5,
        },
        (decodedText: string) => {
          handleBarcode(decodedText);
        },
        () => {} // Ignore errors
      );

      setScanning(true);
    } catch (err: any) {
      setError(err.message || 'Không thể mở camera');
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(() => {});
      } catch {
        // Ignore
      }
    }
    setScanning(false);
    setMode('idle');
  }, []);

  const handleBarcode = (barcode: string) => {
    stopScanner();

    // Check if barcode already exists
    if (existingBarcodes.includes(barcode)) {
      setError(`Mã vạch "${barcode}" đã tồn tại trong danh sách. Vui lòng thêm mã khác.`);
      setTimeout(() => {
        setMode('idle');
        setError(null);
      }, 2000);
      return;
    }

    onBarcodeDetected(barcode);
    onClose();
  };

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(null);
      setMode('upload');

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const html5QrCode = new Html5Qrcode('scanner-reader');

        await html5QrCode.scanFile(file, true);

        // Get the last decoded result
        const result = await new Promise<string>((resolve, reject) => {
          html5QrCode.scanFile(file, true)
            .then((decodedText: string) => resolve(decodedText))
            .catch((err: any) => reject(err));
        });

        handleBarcode(result);
      } catch (err: any) {
        setError('Không tìm thấy mã vạch hợp lệ trong ảnh');
        setTimeout(() => {
          setMode('idle');
          setError(null);
        }, 2000);
      }
    },
    [existingBarcodes, onBarcodeDetected, onClose, stopScanner]
  );

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Quét mã barcode</h3>
              <p className="text-sm text-gray-500">Thêm mã vạch cho sản phẩm</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scanner area */}
          <div className="relative">
            <div
              id="scanner-reader"
              className={mode === 'camera' ? 'block' : 'hidden'}
              style={{ height: '300px', background: '#000' }}
            />

            {mode === 'idle' && (
              <div
                className="h-[300px] flex flex-col items-center justify-center bg-gray-900"
                style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)' }}
              >
                <div className="text-center p-6">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path strokeDasharray="4 4" d="M7 8h10M7 12h6" />
                  </svg>
                  <p className="text-gray-400 mb-6">Chọn phương thức quét mã barcode</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={startCamera} size="lg">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Mở camera
                    </Button>
                    <Button variant="secondary" onClick={triggerFileUpload} size="lg">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upload ảnh
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {mode === 'upload' && (
              <div className="h-[300px] flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-400">Đang xử lý ảnh...</p>
                </div>
              </div>
            )}

            {/* Scan overlay */}
            {mode === 'camera' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-6 sm:inset-8 border-2 border-white/20 rounded-2xl" />
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 border-2 border-primary-500 rounded-lg"
                  animate={{
                    boxShadow: ['0 0 20px rgba(234, 88, 12, 0.3)', '0 0 40px rgba(234, 88, 12, 0.6)', '0 0 20px rgba(234, 88, 12, 0.3)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute top-[15%] bottom-[15%] w-0.5 bg-gradient-to-b from-transparent via-primary-500 to-transparent"
                  animate={{ left: ['15%', '85%', '15%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
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
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between">
            <Button variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            {mode === 'camera' && (
              <Button variant="outline" onClick={stopScanner}>
                Dừng camera
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
