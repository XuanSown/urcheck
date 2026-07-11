'use client';

import { motion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

export function ContactHero() {
  const { t } = useLocale();

  const reveal: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative min-h-[68vh] flex flex-col items-center justify-center pt-28 sm:pt-32 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 grain-overlay">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-primary-500/5 dark:bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[300px] sm:w-[450px] lg:w-[600px] h-[300px] sm:h-[450px] lg:h-[600px] bg-primary-500/5 dark:bg-primary-600/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.06) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.span
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="inline-block text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase mb-4"
        >
          {t('contact_kicker')}
        </motion.span>

        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight"
        >
          {t('contact_title')}
        </motion.h1>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          {t('contact_subtitle')}
        </motion.p>
      </div>
    </section>
  );
}

export default ContactHero;
