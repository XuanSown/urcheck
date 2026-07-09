'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';
import { Counter } from '@/components/about/Counter';

interface Stat {
  value?: number;
  textValue?: string;
  suffixKey?: string;
  labelKey: string;
}

export function SecurityStats() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  const STATS: Stat[] = [
    { value: Number(t('security_stat_1_value')), suffixKey: 'security_stat_1_suffix', labelKey: 'security_stat_1_label' },
    { value: Number(t('security_stat_2_value')), suffixKey: 'security_stat_2_suffix', labelKey: 'security_stat_2_label' },
    { value: Number(t('security_stat_3_value')), labelKey: 'security_stat_3_label' },
    { textValue: t('security_stat_4_value'), labelKey: 'security_stat_4_label' },
  ];

  const reveal: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <div className="relative z-10 mx-auto max-w-7xl rounded-3xl bg-gray-50 dark:bg-gray-900 grain-overlay px-6 py-14 sm:px-10 sm:py-16 lg:px-16 overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full bg-primary-500/5 dark:bg-primary-600/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <motion.span
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={reveal}
            className="text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase"
          >
            {t('security_stats_kicker')}
          </motion.span>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={reveal}
            className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white"
          >
            {t('security_stats_title')}
          </motion.h2>
        </div>

        <div className="relative z-10 mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {stat.textValue !== undefined ? (
                <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400">
                  {stat.textValue}
                </span>
              ) : (
                <Counter
                  value={stat.value ?? 0}
                  suffix={stat.suffixKey ? t(stat.suffixKey) : ''}
                  className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400"
                />
              )}
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

export default SecurityStats;
