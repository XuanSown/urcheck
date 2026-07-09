'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/components/I18nProvider';

const Scene3D = dynamic(() => import('@/components/about/Scene3D'), { ssr: false });

export function BrandsHero() {
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
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 grain-overlay">
      {/* Background: 3D scene + soft blobs + vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0">
          <Scene3D />
        </div>
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
          {t('brands_kicker')}
        </motion.span>

        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight"
        >
          {t('brands_title')}
        </motion.h1>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          {t('brands_subtitle')}
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
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-xl hover:shadow-2xl hover:shadow-primary-500/20 transform hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              {t('brands_cta_primary')}
            </Button>
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto shadow-md hover:shadow-xl transform hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              {t('brands_cta_secondary')}
            </Button>
          </Link>
        </motion.div>
      </div>

      {!reducedMotion && (
        <motion.div
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
            }
            className="w-5 h-8 sm:w-6 sm:h-9 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center pt-1.5"
            aria-hidden="true"
          >
            <motion.div
              animate={reducedMotion ? undefined : { opacity: [1, 0.3, 1], y: [0, 6, 0] }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
              }
              className="w-1 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}

export default BrandsHero;
