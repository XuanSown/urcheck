'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

const PARAGRAPHS = ['about_story_p1', 'about_story_p2', 'about_story_p3'] as const;

export function StorySection() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="story"
      className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white dark:bg-gray-950 grain-overlay"
    >
      {/* Soft depth blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-primary-500/5 dark:bg-primary-600/10 blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Sticky kicker + title */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <span className="text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase">
                {t('about_story_kicker')}
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                {t('about_story_title')}
              </h2>
            </div>
          </div>

          {/* Narrative paragraphs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {PARAGRAPHS.map((key, index) => (
              <motion.p
                key={key}
                initial={
                  reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 24, clipPath: 'inset(0 100% 0 0)' }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                  clipPath: 'inset(0 0% 0 0)',
                }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={
                  'max-w-2xl text-base sm:text-lg leading-relaxed ' +
                  (index === 1
                    ? 'bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent font-semibold dark:from-primary-400 dark:via-primary-300 dark:to-primary-200'
                    : 'text-gray-600 dark:text-gray-400')
                }
              >
                {t(key)}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
