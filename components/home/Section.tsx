'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

export function Section({ id, title, subtitle, children, className = '' }: { id?: string; title?: string; subtitle?: string; children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <section id={id} className={`py-14 sm:py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-10 sm:mb-14">
            {title && <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{title}</h2>}
            {subtitle && <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
