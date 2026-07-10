'use client';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useLocale } from '@/components/I18nProvider';
import { HeroScene3DFallback } from '@/components/home/HeroScene3D';

const HeroScene3D = dynamic(() => import('@/components/home/HeroScene3D'), {
  ssr: false,
  loading: () => <HeroScene3DFallback />,
});

export function Hero({ onScan, onExplore }: { onScan?: () => void; onExplore?: () => void }) {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const rise = (d = 0.3) => ({ initial: reduced ? { opacity: 0 } : { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: reduced ? 0 : d, ease: [0.16, 1, 0.3, 1] as const } });
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
          <motion.span {...rise()} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {t('hero_trust_1')}
          </motion.span>
          <motion.h1 {...rise()} className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            <span className="block">{t('hero_headline_1')}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400">{t('hero_headline_2')}</span>
          </motion.h1>
          <motion.p {...rise()} className="mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0">
            {t('hero_subtitle')}<span className="hidden sm:inline">{t('hero_subtitle_highlight')}</span>
          </motion.p>
          <motion.div {...rise()} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Button size="xl" onClick={onScan} className="w-full sm:w-auto shadow-xl hover:shadow-primary-500/20">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 001.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {t('hero_cta')}
            </Button>
            <Link href="/discover" onClick={onExplore} className="w-full sm:w-auto">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">{t('hero_explore')}</Button>
            </Link>
          </motion.div>
        </div>
        <motion.div {...rise()} className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] sm:aspect-[4/3] lg:aspect-square bg-gradient-to-tr from-primary-500/10 to-transparent">
            <HeroScene3D />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium text-gray-900 dark:text-white">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Đã xác minh
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
