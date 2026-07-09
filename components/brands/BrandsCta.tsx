'use client';

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/components/I18nProvider';

export function BrandsCta() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  const reveal: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 px-6 py-16 sm:px-12 sm:py-20 lg:px-16 text-center grain-overlay">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={reveal}
              className="inline-block text-xs sm:text-sm font-medium tracking-[0.3em] text-white/80 uppercase mb-4"
            >
              {t('brands_cta_kicker')}
            </motion.span>

            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={reveal}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight"
            >
              {t('brands_cta_title')}
            </motion.h2>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={reveal}
              className="mt-4 text-base sm:text-lg text-white/90 max-w-xl mx-auto leading-relaxed"
            >
              {t('brands_cta_subtitle')}
            </motion.p>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={reveal}
              className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
            >
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary-700 hover:bg-primary-50 dark:bg-white dark:text-primary-700 dark:hover:bg-primary-50 shadow-xl transform hover:scale-[1.03] active:scale-95 transition-all duration-300"
                >
                  {t('brands_cta_primary')}
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/70 text-white hover:bg-white/10 dark:hover:bg-white/10 shadow-md transform hover:scale-[1.03] active:scale-95 transition-all duration-300"
                >
                  {t('brands_cta_secondary')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BrandsCta;
