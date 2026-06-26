'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductInfo } from '@/components/ProductInfo';
import { Footer } from '@/components/Footer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { QrScanner } from '@/components/QrScanner';
import { Product } from '@/types/product';
import { useLocale } from '@/components/I18nProvider';
import { extractQrCode } from '@/lib/qr-utils';

interface VerifyResponse {
  success: boolean;
  valid: boolean;
  qrCode?: {
    code: string;
    scanCount: number;
  };
  product?: Product;
  message?: string;
}

function HomeInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();

  // Input state - auto-fill from ?q= when arriving via QR scan.
  const [codeInput, setCodeInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // When ?q=AB12CD is in the URL, pre-fill the input and trigger verification.
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !verifyResult && !isLoading) {
      setCodeInput(q);
      void handleVerify(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (rawInput?: string) => {
    const input = (rawInput ?? codeInput).trim();
    if (!input) return;
    const cleaned = extractQrCode(input);
    if (!cleaned) {
      setError(t('verify_invalid_code'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerifyResult(null);

    try {
      const response = await fetch(`/api/qr/${encodeURIComponent(cleaned)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data: VerifyResponse = await response.json();

      if (data.success && data.valid && data.product) {
        setVerifyResult(data);
      } else {
        setError(data.message || t('verify_invalid_code'));
      }
    } catch (err) {
      console.error('Verify error:', err);
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVerifyResult(null);
    setError(null);
    setCodeInput('');
    // Keep locale, drop the ?q= query for a clean URL.
    router.replace('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        <Hero />

        <section id="verify" className="py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 dark:text-primary-400 mb-3 sm:mb-4">
                {t('verify_title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base">
                {t('verify_subtitle')}
              </p>
            </motion.div>

            {/* Verify form */}
            <AnimatePresence mode="wait">
              {!verifyResult ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8"
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleVerify();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="qr-input"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {locale === 'vi' ? 'Mã QR hoặc URL' : 'QR code or URL'}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          id="qr-input"
                          type="text"
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value)}
                          placeholder={t('verify_input_placeholder')}
                          className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
                          autoComplete="off"
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="lg"
                          onClick={() => setShowScanner(true)}
                          className="w-full sm:w-auto"
                          aria-label={locale === 'vi' ? 'Mở camera quét mã QR' : 'Open camera to scan QR'}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 001.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {locale === 'vi' ? 'Quét bằng camera' : 'Scan with camera'}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading || !codeInput.trim()}
                      loading={isLoading}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? t('verify_loading') : t('verify_button')}
                    </Button>
                  </form>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-start gap-3"
                        role="alert"
                      >
                        <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-400">
                            {locale === 'vi' ? 'Lỗi' : 'Error'}
                          </h4>
                          <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Loading */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mt-6 p-6 bg-primary-50/50 border border-primary-200 dark:border-primary-800/30 rounded-xl backdrop-blur-sm flex items-center justify-center gap-3"
                      >
                        <LoadingSpinner size="md" />
                        <span className="text-primary-700 dark:text-primary-400 font-medium text-sm sm:text-base">
                          {t('verify_loading')}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <ProductInfo product={verifyResult.product!} />
                  <div className="text-center">
                    <Button variant="outline" size="lg" onClick={handleReset}>
                      {t('verify_another')}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />

      {/* QR scanner dialog — opened from input button or Hero CTA */}
      <QrScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={(decoded) => {
          setShowScanner(false);
          setCodeInput(decoded);
          void handleVerify(decoded);
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeInner />
    </Suspense>
  );
}

function HomeSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1 grid place-items-center">
        <LoadingSpinner size="lg" />
      </main>
      <Footer />
    </div>
  );
}
