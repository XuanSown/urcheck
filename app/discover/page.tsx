'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';
import { FilterBar } from '@/components/FilterBar';
import { DiscoverFeed } from '@/components/discover/DiscoverFeed';
import { WishlistGrid } from '@/components/discover/WishlistGrid';

export default function DiscoverPage() {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<'discover' | 'saved'>('discover');
  const [skinType, setSkinType] = useState<string | undefined>();
  const [brand, setBrand] = useState<string | undefined>();

  const tabs = [
    { key: 'discover' as const, label: t('discover_tab_discover') },
    { key: 'saved' as const, label: t('discover_tab_saved') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tab === 'saved' ? t('discover_saved_title') : t('feed_title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{tab === 'saved' ? '' : t('feed_subtitle')}</p>
        </motion.div>

        <div className="flex gap-1 mt-6 border-b border-gray-200 dark:border-gray-800" role="tablist" aria-label="discover tabs">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              role="tab"
              aria-selected={tab === tb.key}
              onClick={() => setTab(tb.key)}
              className={`relative px-4 py-2 text-sm font-medium ${tab === tb.key ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {tb.label}
              {tab === tb.key && <motion.span layoutId="discover-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary-600 dark:bg-primary-400" />}
            </button>
          ))}
        </div>

        {tab === 'discover' ? (
          <>
            <FilterBar skinType={skinType} brand={brand} onSkinTypeChange={setSkinType} onBrandChange={setBrand} onReset={() => { setSkinType(undefined); setBrand(undefined); }} />
            <DiscoverFeed skinType={skinType} brand={brand} />
          </>
        ) : (
          <div className="pt-6"><WishlistGrid /></div>
        )}
      </div>
    </div>
  );
}
