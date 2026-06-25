'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] sm:min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 grain-overlay">
      {/* Sophisticated animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large morphing blob — primary */}
        <motion.div
          className="absolute -top-1/4 -right-1/4 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-primary-500/5 dark:bg-primary-600/10 rounded-full"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 60, 0],
            borderRadius: [
              '30% 70% 70% 30% / 30% 30% 70% 70%',
              '70% 30% 30% 70% / 70% 70% 30% 30%',
              '30% 70% 70% 30% / 30% 30% 70% 70%',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Secondary blob — stone accent */}
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 w-[300px] sm:w-[450px] lg:w-[600px] h-[300px] sm:h-[450px] lg:h-[600px] bg-accent-stone/10 dark:bg-accent-stone/20 rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Small accent glow */}
        <motion.div
          className="absolute top-1/3 left-1/4 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-primary-400/15 dark:bg-primary-500/15 rounded-full blur-3xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto text-center z-10 px-2 sm:px-4 pt-16 sm:pt-0">
        {/* Logo — smaller with premium animation */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6 sm:mb-8 flex justify-center"
        >
          <motion.div
            whileHover={{ scale: 0.97 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative group"
          >
            <Logo size="md" variant="dark" />
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-primary-500/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        </motion.div>

        {/* Headline — with staggered reveal */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 1.4,
              },
            },
          }}
          className="space-y-3 sm:space-y-4"
        >
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-[1.1] tracking-tight"
          >
            <span className="block">Kiểm tra nguồn gốc</span>
            <motion.span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% auto' }}
            >
              sản phẩm mỹ phẩm
            </motion.span>
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
            className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2"
          >
            Quét mã QR để xác minh tính hợp lệ, ngày sản xuất, hạn sử dụng và thông tin nhà sản xuất.
            <span className="hidden sm:inline"> Nhanh chóng, miễn phí, không cần đăng ký.</span>
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0"
          >
            <Link href="#scanner" className="w-full sm:w-auto">
              <Button
                size="xl"
                className="w-full sm:w-auto shadow-xl hover:shadow-2xl hover:shadow-primary-500/20 transform hover:scale-[1.03] active:scale-95 transition-all duration-300 group relative overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-200%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
                <svg
                  className="mr-2 h-5 w-5 sm:h-6 sm:w-6 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h1v14H3M6 5h1v14H6M9 5h2v14H9M13 5h1v14h-1M16 5h2v14h-2M21 5h1v14h-1"
                  />
                </svg>
                <span className="relative z-10">Quét mã QR ngay</span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.2 }}
          className="mt-10 sm:mt-16 flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-10 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
        >
          {[
            { icon: '✓', text: 'Không cần đăng ký' },
            { icon: '⚡', text: 'Quét nhanh 2s' },
            { icon: '🔒', text: '100% miễn phí' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 2.2 + index * 0.15 }}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-primary-600 dark:text-primary-500">
                {item.icon}
              </div>
              <span>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 sm:w-6 sm:h-9 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center pt-1.5"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
