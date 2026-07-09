'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';
import { Counter } from '@/components/about/Counter';

interface Stat {
  value: number;
  suffixKey: string;
  decimals?: number;
  labelKey: string;
}

const STATS: Stat[] = [
  { value: 1000000, suffixKey: 'about_stat_1_suffix', labelKey: 'about_stat_1_label' },
  { value: 500000, suffixKey: 'about_stat_2_suffix', labelKey: 'about_stat_2_label' },
  { value: 99.9, suffixKey: 'about_stat_3_suffix', decimals: 1, labelKey: 'about_stat_3_label' },
  { value: 2, suffixKey: 'about_stat_4_suffix', labelKey: 'about_stat_4_label' },
];

export function StatsSection() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="stats"
      className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950"
    >
      <div className="relative z-10 mx-auto max-w-7xl rounded-3xl bg-gray-50 dark:bg-gray-900 grain-overlay px-6 py-14 sm:px-10 sm:py-16 lg:px-16 overflow-hidden">
        {/* Soft amber blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full bg-primary-500/5 dark:bg-primary-600/10 blur-3xl"
        />

        <div className="relative z-10 max-w-2xl">
          <span className="text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase">
            {t('about_stats_kicker')}
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {t('about_stats_title')}
          </h2>
        </div>

        <div className="relative z-10 mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Counter
                value={stat.value}
                suffix={t(stat.suffixKey)}
                decimals={stat.decimals}
                className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400"
              />
              <span className="mt-2 block text-sm text-gray-500 dark:text-gray-400">
                {t(stat.labelKey)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
