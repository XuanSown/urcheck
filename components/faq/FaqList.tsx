'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/I18nProvider';

interface FaqItem {
  qKey: string;
  aKey: string;
}

interface FaqGroup {
  headingKey: string;
  items: FaqItem[];
}

const GROUPS: FaqGroup[] = [
  {
    headingKey: 'faq_cat_consumer',
    items: [
      { qKey: 'faq_q1_q', aKey: 'faq_q1_a' },
      { qKey: 'faq_q2_q', aKey: 'faq_q2_a' },
      { qKey: 'faq_q3_q', aKey: 'faq_q3_a' },
    ],
  },
  {
    headingKey: 'faq_cat_brand',
    items: [
      { qKey: 'faq_q4_q', aKey: 'faq_q4_a' },
      { qKey: 'faq_q5_q', aKey: 'faq_q5_a' },
      { qKey: 'faq_q6_q', aKey: 'faq_q6_a' },
    ],
  },
];

export function FaqList() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return GROUPS;
    return GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const q = t(item.qKey).toLowerCase();
        const a = t(item.aKey).toLowerCase();
        return q.includes(normalizedQuery) || a.includes(normalizedQuery);
      }),
    })).filter((group) => group.items.length > 0);
  }, [normalizedQuery, t]);

  const accordionVariants: Variants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: 'auto',
      opacity: 1,
      transition: reducedMotion
        ? { duration: 0 }
        : { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: reducedMotion ? { duration: 0 } : { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="relative mb-8 sm:mb-10">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('faq_search')}
            aria-label={t('faq_search')}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 transition-all duration-300 text-sm sm:text-base"
          />
        </div>

        {filteredGroups.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            {t('faq_search')}
          </p>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {filteredGroups.map((group) => (
              <div key={group.headingKey}>
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 mb-4">
                  {t(group.headingKey)}
                </h2>
                <ul className="space-y-3">
                  {group.items.map((item) => {
                    const id = item.qKey;
                    const isOpen = open === id;
                    return (
                      <li
                        key={id}
                        className={cn(
                          'liquid-glass rounded-2xl overflow-hidden transition-colors duration-300',
                          isOpen && 'ring-1 ring-primary-500/40'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setOpen(isOpen ? null : id)}
                          aria-expanded={isOpen}
                          aria-controls={`${id}-answer`}
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left"
                        >
                          <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                            {t(item.qKey)}
                          </span>
                          <svg
                            className={cn(
                              'w-5 h-5 flex-shrink-0 text-primary-600 dark:text-primary-400 transition-transform duration-300',
                              isOpen && 'rotate-180'
                            )}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              id={`${id}-answer`}
                              key="answer"
                              variants={accordionVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="overflow-hidden"
                            >
                              <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-400">
                                {t(item.aKey)}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
