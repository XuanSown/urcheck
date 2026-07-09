'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

interface Platform {
  name: string;
  desc: string;
  icon: React.ReactNode;
}

const ICON_CLASS = 'h-6 w-6';

function MarkShopify() {
  return (
    <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7l3-2 4 1 4-1 3 2 1 5-2 9H5l-2-9 1-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10c0 2 1.5 3 3 3s3-1 3-3" />
    </svg>
  );
}

function MarkWoo() {
  return (
    <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01M12 9v6" />
    </svg>
  );
}

function MarkSalesforce() {
  return (
    <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" />
    </svg>
  );
}

function MarkErp() {
  return (
    <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function MarkZapier() {
  return (
    <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4l3 6-3 2-3-2 3-6zM12 12l3 6-3 2-3-2 3-6z" />
    </svg>
  );
}

function MarkSheets() {
  return (
    <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path strokeLinecap="round" d="M4 9h16M4 14h16M9 4v16M14 4v16" />
    </svg>
  );
}

const PLATFORMS: Platform[] = [
  { name: 'Shopify', desc: 'Đồng bộ sản phẩm và mã QR với cửa hàng của bạn.', icon: <MarkShopify /> },
  { name: 'WooCommerce', desc: 'Gắn mã xác thực vào mỗi đơn hàng xuất kho.', icon: <MarkWoo /> },
  { name: 'Salesforce', desc: 'Quản lý khách hàng kèm lịch sử xác minh.', icon: <MarkSalesforce /> },
  { name: 'ERP', desc: 'Kết nối hệ thống quản trị nội bộ doanh nghiệp.', icon: <MarkErp /> },
  { name: 'Zapier', desc: 'Tự động hóa luồng công việc không cần code.', icon: <MarkZapier /> },
  { name: 'Google Sheets', desc: 'Xuất báo cáo quét vào bảng tính trực tiếp.', icon: <MarkSheets /> },
];

const card: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function IntegrationsGrid() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();
  const [toast, setToast] = useState<string | null>(null);

  const handleConnect = (name: string) => {
    setToast(`${name} — ${t('nav_integrations')}: Liên hệ tích hợp`);
    window.setTimeout(() => setToast(null), 2600);
  };

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {PLATFORMS.map((p, index) => (
            <motion.div
              key={p.name}
              initial={reducedMotion ? { opacity: 0 } : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={card}
              transition={reducedMotion ? { duration: 0.5 } : { delay: index * 0.08 }}
              className="hover-tilt group relative flex flex-col rounded-3xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/60 p-6 sm:p-7 backdrop-blur-sm transition-all duration-300 hover:border-primary-500/40 dark:hover:border-primary-400/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                {p.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
                {p.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {p.desc}
              </p>
              <button
                type="button"
                onClick={() => handleConnect(p.name)}
                className="mt-6 inline-flex items-center justify-center rounded-full border border-primary-600/30 dark:border-primary-400/30 px-5 py-2.5 text-sm font-medium text-primary-700 dark:text-primary-300 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 transition-colors duration-200"
              >
                {t('nav_integrations')}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 dark:bg-white px-5 py-3 text-sm font-medium text-white dark:text-gray-900 shadow-lg"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default IntegrationsGrid;
