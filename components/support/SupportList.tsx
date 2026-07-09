'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n';

export interface SupportArticleItem {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  bodyVi: string | null;
  bodyEn: string | null;
  category: string;
  order: number;
}

type Grouped = Record<string, SupportArticleItem[]>;

export default function SupportList({
  grouped,
  categories,
  locale,
}: {
  grouped: Grouped;
  categories: string[];
  locale: Locale;
}) {
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const pick = (vi: string, en: string) => (locale === 'en' ? en : vi);

  const q = query.trim().toLowerCase();

  const filtered = categories
    .map((cat) => ({
      category: cat,
      items: grouped[cat].filter((a) => {
        if (!q) return true;
        const title = pick(a.titleVi, a.titleEn).toLowerCase();
        const body = pick(a.bodyVi || '', a.bodyEn || '').toLowerCase();
        return title.includes(q) || body.includes(q) || cat.toLowerCase().includes(q);
      }),
    }))
    .filter((g) => g.items.length > 0);

  const totalResults = filtered.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      <div className="relative max-w-2xl mx-auto mb-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('support_search')}
          aria-label={t('support_search')}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {totalResults === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">{t('support_empty')}</p>
        </div>
      ) : (
        <div className="space-y-12">
          {filtered.map((group) => (
            <section key={group.category}>
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-primary-600 dark:text-primary-400 mb-5">
                {group.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {group.items.map((a, idx) => {
                  const articleTitle = pick(a.titleVi, a.titleEn);
                  const body = pick(a.bodyVi || '', a.bodyEn || '');
                  const isOpen = openId === a.id;
                  return (
                    <motion.div
                      key={a.id}
                      initial={reduced ? false : { opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      className="hover-tilt"
                    >
                      <article className="glass rounded-2xl border border-gray-200 dark:border-gray-800 h-full flex flex-col transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-700">
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : a.id)}
                          aria-expanded={isOpen}
                          className="w-full text-left p-5 flex items-start justify-between gap-3"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {articleTitle}
                          </h3>
                          <svg
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isOpen && body && (
                          <div className="px-5 pb-5 -mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                            {body}
                          </div>
                        )}
                      </article>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-14 text-center glass rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
        <p className="text-gray-600 dark:text-gray-400">{t('support_contact_prompt')}</p>
        <Link
          href="/contact"
          className="mt-3 inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          {t('support_contact_link')}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
