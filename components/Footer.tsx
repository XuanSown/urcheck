'use client';

import React from 'react';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    contact: [
      { icon: '📧', label: 'support@urcheck.vn', href: 'mailto:support@urcheck.vn' },
      { icon: '📞', label: '1900 xxxx', href: 'tel:1900xxxx' },
      { icon: '📍', label: 'TP. Hồ Chí Minh, Việt Nam', href: '#' },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <footer className="relative bg-gray-950 text-gray-300 mt-auto overflow-hidden">
      {/* Decorative gradient border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/60 to-transparent" />

      {/* Subtle grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }} />
      </div>

      <motion.div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
          {/* Brand Section */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <Link href="/" className="inline-block group">
              <div className="relative">
                <Logo size="sm" variant="light" className="group-hover:opacity-80 transition-opacity duration-300" />
                {/* Animated underline */}
                <motion.div
                  className="absolute -bottom-1.5 left-0 h-[1px] bg-gradient-to-r from-primary-500 to-primary-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                />
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Nền tảng xác minh nguồn gốc sản phẩm mỹ phẩm bằng công nghệ mã vạch — nhanh chóng, chính xác và miễn phí.
            </p>

            {/* Tech stack badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {['Barcode Scan', 'Xác minh tức thì', 'Miễn phí'].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 text-[10px] sm:text-xs font-medium rounded-md bg-gray-900 text-gray-500 border border-gray-800 hover:border-gray-700 hover:text-gray-400 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Liên hệ */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em]">
              Liên hệ
            </h3>
            <ul className="space-y-3">
              {footerLinks.contact.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300 flex items-start gap-2.5 group"
                  >
                    <span className="text-base flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                    <span className="break-all sm:break-normal">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-2">
              {[
                {
                  label: 'Facebook',
                  href: '#',
                  svg: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                },
                {
                  label: 'Zalo',
                  href: '#',
                  svg: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.18-.21-.468-.21-.648 0l-2.94 3.42-1.26-1.47c-.18-.21-.468-.21-.648 0-.18.21-.18.54 0 .75l1.584 1.83c.18.21.468.21.648 0l3.264-3.78c.18-.21.18-.54 0-.75zM6.432 15.84h4.416c.36 0 .648-.288.648-.648s-.288-.648-.648-.648H7.728l3.576-4.464c.144-.18.18-.432.072-.648-.108-.216-.324-.348-.576-.348H6.432c-.36 0-.648.288-.648.648s.288.648.648.648h3.12l-3.576 4.464c-.144.18-.18.432-.072.648.108.216.324.348.576.348z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-gray-500 border border-gray-800 hover:border-primary-600 hover:text-primary-400 hover:bg-gray-800 transition-all duration-300"
                >
                  {social.svg}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800/60"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-xs text-gray-600">
              <p>&copy; {currentYear} ur check. Bảo lưu mọi quyền.</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                </span>
                <span>Hệ thống đang hoạt động</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Phát triển tại</span>
              <span className="text-sm">🇻🇳</span>
              <span>Việt Nam</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
