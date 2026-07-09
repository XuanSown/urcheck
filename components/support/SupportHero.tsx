'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function SupportHero({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle: string;
}) {
  const reduced = useReducedMotion();
  return (
    <section className="relative text-center mb-12 grain-overlay rounded-3xl py-12 px-4 overflow-hidden">
      <div className="pointer-events-none absolute -top-10 -right-6 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl" />
      <motion.span
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="inline-block text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase mb-4"
      >
        {kicker}
      </motion.span>
      <motion.h1
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
      >
        {subtitle}
      </motion.p>
    </section>
  );
}
