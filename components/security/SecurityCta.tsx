'use client';

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';
import { Button } from '@/components/ui/Button';

export function SecurityCta() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  const reveal: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 px-6 py-14 sm:px-10 sm:py-16 lg:px-16 text-center"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.25),transparent_60%)]" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={reveal}
              className="text-xs sm:text-sm font-medium tracking-[0.3em] text-white/80 uppercase"
            >
              {t('security_cta_kicker')}
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={reveal}
              className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
            >
              {t('security_cta_title')}
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={reveal}
              className="mt-4 text-base sm:text-lg text-white/90 leading-relaxed"
            >
              {t('security_cta_subtitle')}
            </motion.p>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={reveal}
              className="mt-8 flex justify-center"
            >
              <Link href="/contact">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 shadow-xl hover:shadow-2xl transform hover:scale-[1.03] active:scale-95 transition-all duration-300"
                >
                  {t('security_cta_primary')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default SecurityCta;
