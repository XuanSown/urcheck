'use client';

import { motion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

const ICONS = [
  // step 1 — tag / qr issue
  (
    <svg key="s1" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5a2 2 0 00-2 2v4.568a2 2 0 00.586 1.414l9.842 9.842a2 2 0 002.828 0l4.568-4.568a2 2 0 000-2.828L11 3.586A2 2 0 009.568 3z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  ),
  // step 2 — camera scan
  (
    <svg key="s2" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 001.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  // step 3 — shield check
  (
    <svg key="s3" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
];

const STEPS = [
  { key: 'how_step1', titleKey: 'how_step1_title', descKey: 'how_step1_desc' },
  { key: 'how_step2', titleKey: 'how_step2_title', descKey: 'how_step2_desc' },
  { key: 'how_step3', titleKey: 'how_step3_title', descKey: 'how_step3_desc' },
] as const;

export function HowSteps() {
  const { t } = useLocale();

  const card: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      id="steps"
      className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white dark:bg-gray-950 grain-overlay"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-primary-500/5 dark:bg-primary-600/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mx-auto max-w-2xl text-center mb-16 sm:mb-20">
          <h2 className="sr-only">{t('how_title')}</h2>
          <p className="text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase">
            {t('how_kicker')}
          </p>
        </div>

        <ol className="relative">
          {/* Connecting vertical line */}
          <div
            aria-hidden="true"
            className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-200 via-primary-400/60 to-primary-200 dark:from-primary-900 dark:via-primary-700/50 dark:to-primary-900"
          />

          {STEPS.map((step, index) => {
            const isLeft = index % 2 === 0;
            return (
              <li key={step.key} className="relative mb-16 sm:mb-24 last:mb-0">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-100px' }}
                  variants={card}
                  className={
                    'relative flex items-start gap-6 md:gap-0 md:grid md:grid-cols-2 md:items-center ' +
                    (isLeft ? '' : 'md:[direction:rtl]')
                  }
                >
                  {/* Number badge on the line (mobile left, desktop center) */}
                  <span
                    aria-hidden="true"
                    className="absolute left-6 md:left-1/2 -translate-x-1/2 top-0 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-500/30 ring-4 ring-white dark:ring-gray-950"
                  >
                    <span className="text-lg font-bold">{index + 1}</span>
                  </span>

                  {/* Content card */}
                  <div className={isLeft ? 'md:pr-16 md:pl-0 pl-20' : 'md:pl-16 pl-20 md:[direction:ltr]'}>
                    <div className="liquid-glass rounded-2xl p-6 sm:p-8 hover-tilt">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                          {ICONS[index]}
                        </span>
                        <span className="text-sm font-mono font-semibold text-primary-600 dark:text-primary-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {t(step.titleKey)}
                      </h3>
                      <p className="mt-3 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                        {t(step.descKey)}
                      </p>
                    </div>
                  </div>

                  {/* Spacer for the opposite side on desktop */}
                  <div className="hidden md:block" aria-hidden="true" />
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default HowSteps;
