'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

const BRANDS = ['LUMIÈRE', 'DERMALAB', 'VERA', 'NATUREX', 'ORGANA'];

function Diamond() {
  return (
    <span
      aria-hidden="true"
      className="mx-6 inline-block h-1.5 w-1.5 rotate-45 bg-primary-500"
    />
  );
}

export function BrandsTrusted() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  const row = (
    <div className="flex shrink-0 items-center">
      {BRANDS.map((name) => (
        <span key={name} className="flex items-center">
          <span className="tracking-[0.25em] text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 uppercase">
            {name}
          </span>
          <Diamond />
        </span>
      ))}
    </div>
  );

  if (reducedMotion) {
    return (
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase mb-8"
          >
            {t('brands_trusted')}
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-3">
            {BRANDS.map((name) => (
              <span
                key={name}
                className="rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-5 py-2 text-sm font-medium tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 overflow-hidden">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-7xl text-center text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase mb-8"
      >
        {t('brands_trusted')}
      </motion.h2>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <motion.div
          className="flex w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {row}
          {row}
        </motion.div>
      </div>
    </section>
  );
}

export default BrandsTrusted;
