'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';
import { PricingCards } from '@/components/pricing/PricingCards';

export function PricingToggle() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section
      id="pricing"
      className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-center mb-10 sm:mb-14">
          <div
            role="tablist"
            aria-label={t('pricing_kicker')}
            className="relative inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-1"
          >
            {(['monthly', 'yearly'] as const).map((value) => {
              const active = period === value;
              return (
                <button
                  key={value}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setPeriod(value)}
                  className="relative z-10 inline-flex items-center rounded-full px-4 sm:px-6 py-2 text-sm font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {active && (
                    <motion.span
                      layoutId={reducedMotion ? undefined : 'pricing-period-pill'}
                      className="absolute inset-0 rounded-full bg-primary-600 shadow-md shadow-primary-500/20"
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                      }
                    />
                  )}
                  <span className={active ? 'text-white' : 'text-gray-600 dark:text-gray-400'}>
                    {t(value === 'monthly' ? 'pricing_toggle_monthly' : 'pricing_toggle_yearly')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <PricingCards period={period} />
      </div>
    </section>
  );
}

export default PricingToggle;
