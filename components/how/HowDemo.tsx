'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/components/I18nProvider';

// Deterministic faux-QR grid (decorative only, not a scannable code).
const QR_SIZE = 21;
function buildFauxQr(): boolean[] {
  const cells: boolean[] = [];
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= QR_SIZE - 7) || (r >= QR_SIZE - 7 && c < 7);
  for (let r = 0; r < QR_SIZE; r++) {
    for (let c = 0; c < QR_SIZE; c++) {
      if (isFinder(r, c)) {
        const lr = r % (QR_SIZE - 1);
        const lc = c % (QR_SIZE - 1);
        const inRing = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const inCore = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        cells.push(inRing || inCore);
      } else {
        cells.push((r * 7 + c * 13 + ((r * c) % 5)) % 3 === 0);
      }
    }
  }
  return cells;
}
const QR_CELLS = buildFauxQr();

export function HowDemo() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 grain-overlay">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full bg-primary-500/5 dark:bg-primary-600/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase"
          >
            {t('how_demo_kicker')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white"
          >
            {t('how_demo_title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed"
          >
            {t('how_demo_desc')}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-md"
        >
          <div className="liquid-glass rounded-3xl p-8 sm:p-10 text-center">
            <div className="flex justify-center">
              <motion.div
                animate={reducedMotion ? undefined : { boxShadow: ['0 0 0 rgba(44,76,126,0)', '0 0 28px rgba(44,76,126,0.45)', '0 0 0 rgba(44,76,126,0)'] }}
                transition={reducedMotion ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-2xl bg-white p-4"
              >
                <svg
                  viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
                  className="h-44 w-44"
                  role="img"
                  aria-label="Sample QR code"
                >
                  <rect width={QR_SIZE} height={QR_SIZE} fill="#ffffff" />
                  {QR_CELLS.map((on, i) =>
                    on ? (
                      <rect
                        key={i}
                        x={i % QR_SIZE}
                        y={Math.floor(i / QR_SIZE)}
                        width={1}
                        height={1}
                        fill="#111111"
                      />
                    ) : null
                  )}
                </svg>
              </motion.div>
            </div>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 font-mono">
              https://urcheck.app/?q=URC-DEMO
            </p>

            <div className="mt-8">
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto">
                  {t('how_cta_primary')}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HowDemo;
