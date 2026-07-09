'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

interface UseCase {
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
}

const ICON_CLASS = 'h-6 w-6';

const USE_CASES: UseCase[] = [
  {
    titleKey: 'brands_uc1_title',
    descKey: 'brands_uc1_desc',
    icon: (
      <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M9.5 11.5h5" />
      </svg>
    ),
  },
  {
    titleKey: 'brands_uc2_title',
    descKey: 'brands_uc2_desc',
    icon: (
      <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6v3l1 3v10a1 1 0 01-1 1H9a1 1 0 01-1-1V9l1-3V3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 13h4M10 16h4" />
      </svg>
    ),
  },
  {
    titleKey: 'brands_uc3_title',
    descKey: 'brands_uc3_desc',
    icon: (
      <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14l-1 11a2 2 0 01-2 2H8a2 2 0 01-2-2L5 8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V6a3 3 0 016 0v2" />
      </svg>
    ),
  },
  {
    titleKey: 'brands_uc4_title',
    descKey: 'brands_uc4_desc',
    icon: (
      <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5l4 2v4l-4 8-4-8V7l4-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14" />
      </svg>
    ),
  },
];

const card: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function BrandsUseCases() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <span className="text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase">
            {t('brands_usecase_kicker')}
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {t('brands_usecase_title')}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {USE_CASES.map((uc, index) => (
            <motion.div
              key={uc.titleKey}
              initial={reducedMotion ? { opacity: 0 } : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={card}
              transition={reducedMotion ? { duration: 0.5 } : { delay: index * 0.1 }}
              className="hover-tilt group relative rounded-3xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/60 p-6 sm:p-7 backdrop-blur-sm transition-all duration-300 hover:border-primary-500/40 dark:hover:border-primary-400/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                {uc.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
                {t(uc.titleKey)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {t(uc.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandsUseCases;
