'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/components/I18nProvider';

export function HowCta() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 dark:from-primary-700 dark:via-primary-600 dark:to-primary-500 px-6 py-16 sm:px-12 sm:py-20 text-center shadow-2xl shadow-primary-500/20">
          {/* Soft glow */}
          <div aria-hidden="true" className="pointer-events-none absolute -top-1/4 -right-1/4 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-1/4 -left-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block text-xs sm:text-sm font-medium tracking-[0.3em] text-white/80 uppercase"
            >
              {t('how_cta_kicker')}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
            >
              {t('how_cta_title')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-base sm:text-lg text-white/90 max-w-xl mx-auto leading-relaxed"
            >
              {t('how_cta_subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex justify-center"
            >
              <Link href="/#verify">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-white/90 dark:bg-gray-100 dark:text-primary-700 dark:hover:bg-white shadow-xl hover:shadow-2xl transform hover:scale-[1.03] active:scale-95 transition-all duration-300"
                >
                  {t('how_cta_primary')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowCta;
