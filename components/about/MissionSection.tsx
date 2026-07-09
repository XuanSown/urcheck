'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

interface Value {
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
}

const VALUES: Value[] = [
  {
    titleKey: 'about_value_1_title',
    descKey: 'about_value_1_desc',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1 1 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178a1 1 0 010 .644C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    titleKey: 'about_value_2_title',
    descKey: 'about_value_2_desc',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    titleKey: 'about_value_3_title',
    descKey: 'about_value_3_desc',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    titleKey: 'about_value_4_title',
    descKey: 'about_value_4_desc',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export function MissionSection() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="mission"
      className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white dark:bg-gray-950 grain-overlay"
    >
      {/* Soft amber blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-[480px] w-[480px] rounded-full bg-primary-500/5 dark:bg-primary-600/10 blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <span className="text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase">
            {t('about_mission_kicker')}
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {t('about_mission_title')}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {VALUES.map((value, index) => (
            <motion.div
              key={value.titleKey}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={
                'group relative glass rounded-2xl p-6 sm:p-8 border border-gray-200/70 dark:border-gray-800/70 hover:shadow-xl hover:shadow-primary-500/20 transition-shadow duration-300 ' +
                (reducedMotion ? '' : 'hover-tilt')
              }
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 transition-transform duration-300 group-hover:scale-110">
                {value.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {t(value.titleKey)}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t(value.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MissionSection;
