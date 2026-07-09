'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

type LegalDocProps = { kind: 'privacy' | 'terms' };

const KEYS: Record<LegalDocProps['kind'], {
  kicker: string;
  title: string;
  updated: string;
  intro: string;
  sec: [string, string, string, string];
  contact: string;
}> = {
  privacy: {
    kicker: 'privacy_kicker',
    title: 'privacy_title',
    updated: 'privacy_updated',
    intro: 'privacy_intro',
    sec: ['privacy_sec1_title', 'privacy_sec2_title', 'privacy_sec3_title', 'privacy_sec4_title'],
    contact: 'privacy_contact',
  },
  terms: {
    kicker: 'terms_kicker',
    title: 'terms_title',
    updated: 'terms_updated',
    intro: 'terms_intro',
    sec: ['terms_sec1_title', 'terms_sec2_title', 'terms_sec3_title', 'terms_sec4_title'],
    contact: 'terms_contact',
  },
};

export function LegalDoc({ kind }: LegalDocProps) {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();
  const k = KEYS[kind];

  const reveal: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  const sections = [1, 2, 3, 4] as const;

  return (
    <article className="relative grain-overlay overflow-hidden bg-white dark:bg-gray-950">
      {/* soft amber glow */}
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary-500/10 dark:bg-primary-600/10 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
        <motion.span
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="inline-block text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase mb-4"
        >
          {t(k.kicker)}
        </motion.span>

        <motion.h1
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight"
        >
          {t(k.title)}
        </motion.h1>

        <motion.div
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <svg className="w-4 h-4 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{t(k.updated)}: 01/01/2025</span>
        </motion.div>

        {/* Section navigation */}
        <nav aria-label="Table of contents" className="mt-8 flex flex-wrap gap-2">
          {sections.map((n) => (
            <a
              key={n}
              href={`#sec${n}`}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              {t(k.sec[n - 1])}
            </a>
          ))}
        </nav>

        <motion.p
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="mt-8 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-400"
        >
          {t(k.intro)}
        </motion.p>

        <div className="mt-12 space-y-12">
          {sections.map((n) => (
            <motion.section
              key={n}
              id={`sec${n}`}
              initial={reducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={reveal}
              className="scroll-mt-24"
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                <span className="text-primary-600 dark:text-primary-400">0{n}. </span>
                {t(k.sec[n - 1])}
              </h2>
              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                {t(`${kind}_sec${n}_body`)}
              </p>
            </motion.section>
          ))}
        </div>

        <motion.div
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={reveal}
          className="mt-12 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {t(k.contact)}
          </p>
        </motion.div>
      </div>
    </article>
  );
}

export default LegalDoc;
