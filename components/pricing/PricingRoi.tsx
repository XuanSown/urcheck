'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';
import { Counter } from '@/components/about/Counter';

interface Roi {
  value: number;
  valueKey: string;
  suffixKey: string;
  labelKey: string;
}

export function PricingRoi() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  const roi: Roi[] = [
    { value: Number(t('pricing_roi_1_value')), valueKey: 'pricing_roi_1_value', suffixKey: 'pricing_roi_1_suffix', labelKey: 'pricing_roi_1_label' },
    { value: Number(t('pricing_roi_2_value')), valueKey: 'pricing_roi_2_value', suffixKey: 'pricing_roi_2_suffix', labelKey: 'pricing_roi_2_label' },
    { value: Number(t('pricing_roi_3_value')), valueKey: 'pricing_roi_3_value', suffixKey: 'pricing_roi_3_suffix', labelKey: 'pricing_roi_3_label' },
  ];

  return (
    <section
      id="roi"
      className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950"
    >
      <div className="relative z-10 mx-auto max-w-7xl rounded-3xl bg-gray-50 dark:bg-gray-900 grain-overlay px-6 py-14 sm:px-10 sm:py-16 lg:px-16 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-primary-500/5 dark:bg-primary-600/10 blur-3xl"
        />

        <div className="relative z-10 max-w-2xl">
          <span className="text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase">
            {t('pricing_roi_kicker')}
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {t('pricing_roi_title')}
          </h2>
        </div>

        <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
          {roi.map((item, index) => (
            <motion.div
              key={item.valueKey}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            >
              <Counter
                value={item.value}
                suffix={t(item.suffixKey)}
                className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400"
              />
              <span className="mt-2 block text-sm text-gray-500 dark:text-gray-400">
                {t(item.labelKey)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingRoi;
