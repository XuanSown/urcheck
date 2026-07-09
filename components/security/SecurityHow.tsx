'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

export function SecurityHow() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  const reveal: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  const qrModules = [
    [1, 0, 1, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [1, 1, 0, 0, 1, 1, 0, 1],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 1, 1, 0, 0, 1, 1],
    [0, 1, 0, 0, 1, 1, 0, 1],
  ];

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 grain-overlay overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-primary-500/5 dark:bg-primary-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <motion.span
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={reveal}
            className="text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase"
          >
            {t('security_how_kicker')}
          </motion.span>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={reveal}
            className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white"
          >
            {t('security_how_title')}
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={reveal}
            className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            {t('security_how_desc')}
          </motion.p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {t('security_qr_title')}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
              {t('security_qr_desc')}
            </p>
          </motion.div>

          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <div className="relative h-64 w-64 sm:h-72 sm:w-72 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-xl">
              <svg viewBox="0 0 8 8" className="h-full w-full" aria-hidden="true">
                <g fill="currentColor" className="text-gray-900 dark:text-white">
                  {qrModules.flatMap((row, r) =>
                    row.map((cell, c) =>
                      cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" /> : null
                    )
                  )}
                </g>
                {/* Lock badge */}
                <g
                  transform="translate(2.5 2.5)"
                  className="text-primary-600 dark:text-primary-400"
                  fill="currentColor"
                >
                  <rect x="0.4" y="1.6" width="2.2" height="1.8" rx="0.3" />
                  <path
                    d="M0.8 1.6 v-0.4 a1.1 1.1 0 0 1 2.2 0 v0.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.35"
                  />
                </g>
                {/* Scan line */}
                <motion.rect
                  x="0"
                  y="0"
                  width="8"
                  height="0.25"
                  fill="var(--primary-500)"
                  initial={{ y: 0 }}
                  animate={reducedMotion ? { y: 0 } : { y: [0, 7.75, 0] }}
                  transition={reducedMotion ? { duration: 0 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  opacity="0.8"
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SecurityHow;
