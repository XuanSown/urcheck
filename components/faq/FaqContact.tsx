'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

export function FaqContact() {
  const { t } = useLocale();

  const reveal = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={reveal}
        className="relative max-w-3xl mx-auto overflow-hidden rounded-3xl liquid-glass px-6 py-8 sm:px-10 sm:py-10 text-center"
      >
        <div className="absolute -top-10 -right-6 h-32 w-32 rounded-full bg-primary-500/20 blur-3xl" aria-hidden="true" />
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
          {t('faq_contact_prompt')}{' '}
          <Link
            href="/contact"
            className="inline-flex items-center font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 link-underline"
          >
            {t('faq_contact_link')}
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
