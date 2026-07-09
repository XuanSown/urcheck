'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from '@/components/I18nProvider';

export function IntegrationsCta() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 dark:from-primary-700 dark:via-primary-600 dark:to-primary-800 px-6 sm:px-12 py-14 sm:py-20 text-center grain-overlay"
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-white/20 blur-3xl" />

          <div className="relative">
            <p className="uppercase tracking-[0.3em] text-xs sm:text-sm font-medium text-white/80">
              {t('integration_cta_kicker')}
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              {t('integration_cta_title')}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              {t('integration_cta_subtitle')}
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-primary-700 font-semibold hover:bg-white/90 transition-colors"
              >
                {t('integration_cta_primary')}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default IntegrationsCta;
