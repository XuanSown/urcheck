'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { QRScanner } from '@/components/QRScanner';
import { ProductInfo } from '@/components/ProductInfo';
import { Footer } from '@/components/Footer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Product } from '@/types/product';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanSuccess = async (qrCode: string) => {
    setIsLoading(true);
    setError(null);
    setProduct(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.valid && data.product) {
          setProduct(data.product);
        } else {
          setError(data.message || 'Mã QR không hợp lệ');
        }
      } else {
        setError(data.message || 'Không thể xác minh mã QR');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
      console.error('Scan error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleReset = () => {
    setProduct(null);
    setError(null);
  };

  // Card animation variants for "how it works"
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Scanner Section */}
        <section id="scanner" className="py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 mb-3 sm:mb-4">
                Quét mã QR để xác minh
              </h2>
              <p className="text-gray-600 max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base">
                Hướng camera vào mã QR trên sản phẩm hoặc upload ảnh để kiểm tra tính hợp lệ
              </p>
            </motion.div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                >
                  <svg
                    className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="font-medium text-red-800">Lỗi</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 p-6 bg-primary-50/50 border border-primary-200 rounded-xl backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-3">
                    <LoadingSpinner size="md" />
                    <span className="text-primary-700 font-medium text-sm sm:text-base">Đang xác minh mã QR...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scanner or Product Result */}
            <AnimatePresence mode="wait">
              {product ? (
                <motion.div
                  key="product"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProductInfo product={product} />
                </motion.div>
              ) : (
                <motion.div
                  key="scanner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* How it works section */}
            <div id="how-it-works" className="mt-14 sm:mt-20">
              <motion.h3
                className="text-xl sm:text-2xl font-bold text-center text-primary-900 mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
              >
                Cách hoạt động
              </motion.h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {[
                  {
                    step: '01',
                    title: 'Quét mã QR',
                    desc: 'Đưa camera vào gần mã QR trên sản phẩm hoặc upload ảnh có mã QR',
                    icon: (
                      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    ),
                  },
                  {
                    step: '02',
                    title: 'Xác minh tự động',
                    desc: 'Hệ thống kiểm tra mã QR với cơ sở dữ liệu và cập nhật trạng thái',
                    icon: (
                      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  },
                  {
                    step: '03',
                    title: 'Xem kết quả',
                    desc: 'Nhận thông tin chi tiết về sản phẩm, nhà sản xuất và tình trạng hợp lệ',
                    icon: (
                      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    ),
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-30px' }}
                    className="relative text-center p-5 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 glass-hover hover-lift group"
                  >
                    {/* Step number watermark */}
                    <div className="absolute top-3 right-4 text-[40px] sm:text-[48px] font-extrabold text-gray-100 dark:text-gray-800 leading-none pointer-events-none select-none">
                      {item.step}
                    </div>

                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-50 text-primary-600 mb-3 sm:mb-4 group-hover:bg-primary-100 group-hover:scale-105 transition-all duration-300">
                        {item.icon}
                      </div>
                      <span className="text-xs font-semibold text-primary-500 mb-1.5 sm:mb-2 block uppercase tracking-widest">
                        Bước {item.step}
                      </span>
                      <h4 className="text-base sm:text-lg font-semibold text-primary-900 mb-1.5 sm:mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
