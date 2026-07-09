'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export function PricingHero() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-[78vh] flex flex-col items-center justify-center pt-32 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 grain-overlay">
      {/* Soft amber blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 -right-1/4 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-primary-500/5 dark:bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[300px] sm:w-[450px] lg:w-[600px] h-[300px] sm:h-[450px] lg:h-[600px] bg-primary-500/5 dark:bg-primary-600/10 rounded-full blur-3xl" />
        {!reducedMotion && (
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[280px] w-[280px] rounded-full bg-primary-400/10 blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.span
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="inline-block text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase mb-4"
        >
          {t('pricing_kicker')}
        </motion.span>

        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400"
        >
          {t('pricing_title')}
        </motion.h1>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          {t('pricing_subtitle')}
        </motion.p>
      </div>
    </section>
  );
}

export default PricingHero;
