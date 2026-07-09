'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Counter } from '@/components/about/Counter';
import { useLocale } from '@/components/I18nProvider';

interface Metric {
  kind: 'string' | 'counter';
  value: string;
  suffix: string;
  decimals?: number;
  labelKey: string;
}

const NUMBER_CLASS =
  'block text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400';

export function BrandsMetrics() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  const METRICS: Metric[] = [
    { kind: 'string', value: t('brands_metric_1_value'), suffix: '', labelKey: 'brands_metric_1_label' },
    { kind: 'string', value: t('brands_metric_2_value'), suffix: '', labelKey: 'brands_metric_2_label' },
    { kind: 'counter', value: t('brands_metric_3_value'), suffix: t('brands_metric_3_suffix'), decimals: 1, labelKey: 'brands_metric_3_label' },
    { kind: 'string', value: t('brands_metric_4_value'), suffix: t('brands_metric_4_suffix'), labelKey: 'brands_metric_4_label' },
  ];

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <div className="relative z-10 mx-auto max-w-7xl rounded-3xl bg-gray-50 dark:bg-gray-900 grain-overlay px-6 py-14 sm:px-10 sm:py-16 lg:px-16 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full bg-primary-500/5 dark:bg-primary-600/10 blur-3xl"
        />

        <div className="relative z-10 max-w-2xl">
          <span className="text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase">
            {t('brands_metrics_kicker')}
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {t('brands_metrics_title')}
          </h2>
        </div>

        <div className="relative z-10 mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {METRICS.map((metric, index) => (
            <motion.div
              key={metric.labelKey}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {metric.kind === 'counter' ? (
                <Counter
                  value={Number(metric.value)}
                  suffix={metric.suffix}
                  decimals={metric.decimals}
                  className={NUMBER_CLASS}
                />
              ) : (
                <span className={NUMBER_CLASS} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {metric.value}
                  {metric.suffix}
                </span>
              )}
              <span className="mt-2 block text-sm text-gray-500 dark:text-gray-400">
                {t(metric.labelKey)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandsMetrics;
