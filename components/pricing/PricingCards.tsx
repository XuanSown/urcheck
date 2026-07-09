'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

interface Plan {
  key: 'free' | 'pro' | 'enterprise';
  nameKey: string;
  descKey: string;
  priceKey: string;
  ctaKey: string;
  ctaHref: string;
  features: string[];
  highlighted?: boolean;
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 flex-shrink-0 text-primary-600 dark:text-primary-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function PricingCards({ period }: { period: 'monthly' | 'yearly' }) {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  const periodSuffix = period === 'monthly' ? t('pricing_per_month') : t('pricing_per_year');

  const plans: Plan[] = [
    {
      key: 'free',
      nameKey: 'pricing_plan_free',
      descKey: 'pricing_plan_free_desc',
      priceKey: 'pricing_plan_free_price',
      ctaKey: 'pricing_cta_free',
      ctaHref: '/customer/register',
      features: [
        'pricing_feature_free_1',
        'pricing_feature_free_2',
        'pricing_feature_free_3',
        'pricing_feature_free_4',
      ],
    },
    {
      key: 'pro',
      nameKey: 'pricing_plan_pro',
      descKey: 'pricing_plan_pro_desc',
      priceKey: 'pricing_plan_pro_price',
      ctaKey: 'pricing_cta_pro',
      ctaHref: '/customer/register',
      highlighted: true,
      features: [
        'pricing_feature_pro_1',
        'pricing_feature_pro_2',
        'pricing_feature_pro_3',
        'pricing_feature_pro_4',
        'pricing_feature_pro_5',
        'pricing_feature_pro_6',
      ],
    },
    {
      key: 'enterprise',
      nameKey: 'pricing_plan_enterprise',
      descKey: 'pricing_plan_enterprise_desc',
      priceKey: 'pricing_plan_enterprise_price',
      ctaKey: 'pricing_cta_enterprise',
      ctaHref: '/contact',
      features: [
        'pricing_feature_ent_1',
        'pricing_feature_ent_2',
        'pricing_feature_ent_3',
        'pricing_feature_ent_4',
        'pricing_feature_ent_5',
        'pricing_feature_ent_6',
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.key}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: 0.7,
            delay: index * 0.12,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
          className={[
            'relative flex flex-col rounded-3xl p-6 sm:p-8 grain-overlay overflow-hidden',
            'bg-gray-50 dark:bg-gray-900 border',
            plan.highlighted
              ? 'border-primary-500 dark:border-primary-400 hover-tilt shadow-xl shadow-primary-500/10'
              : 'border-gray-200 dark:border-gray-800',
          ].join(' ')}
        >
          {plan.highlighted && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-primary-500/20 blur-3xl"
            />
          )}

          <div className="relative">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t(plan.nameKey)}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t(plan.descKey)}
            </p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {t(plan.priceKey)}
              </span>
              {plan.key !== 'enterprise' && (
                <span className="text-sm text-gray-500 dark:text-gray-400">{periodSuffix}</span>
              )}
            </div>

            <Link
              href={plan.ctaHref}
              className={[
                'mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                plan.highlighted
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-xl hover:shadow-primary-500/20 hover:-translate-y-0.5'
                  : 'border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-primary-600 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400',
              ].join(' ')}
            >
              {t(plan.ctaKey)}
            </Link>

            <ul className="mt-8 space-y-3">
              {plan.features.map((featureKey) => (
                <li key={featureKey} className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {t(featureKey)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default PricingCards;
