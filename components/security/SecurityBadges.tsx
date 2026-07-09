'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';

interface Badge {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
}

const BadgesIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M12 3l2.5 1.5L17 3l.5 2.75L20 6.5l-1.5 2.5L20 11.5l-2.5 1.5L17 16l-2.5-1.5L12 16l-2.5-1.5L7 16l-.5-2.75L4 11.5l1.5-2.5L4 6.5l2.5-1.5L7 3l2.5 1.5z" />
    <circle cx="12" cy="9.5" r="2" />
  </svg>
);

const SOC2Icon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5 4 6v5c0 4.5 3.2 8.4 8 10.5 4.8-2.1 8-6 8-10.5V6l-8-3.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
  </svg>
);

const GDPRIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5 4 6v5c0 4.5 3.2 8.4 8 10.5 4.8-2.1 8-6 8-10.5V6l-8-3.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10M9.5 9.5h3.5a2 2 0 0 1 0 4H10" />
  </svg>
);

const DecreeIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 8h6M9 16h4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2.5h9l3 3V21l-3 1H6l-3-1V3.5L6 2.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.5 2.5 3 3h-3v-3z" />
  </svg>
);

export function SecurityBadges() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  const BADGES: Badge[] = [
    { icon: <BadgesIcon />, titleKey: 'security_badge_1_title', descKey: 'security_badge_1_desc' },
    { icon: <SOC2Icon />, titleKey: 'security_badge_2_title', descKey: 'security_badge_2_desc' },
    { icon: <GDPRIcon />, titleKey: 'security_badge_3_title', descKey: 'security_badge_3_desc' },
    { icon: <DecreeIcon />, titleKey: 'security_badge_4_title', descKey: 'security_badge_4_desc' },
  ];

  const reveal: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <motion.span
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={reveal}
            className="text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase"
          >
            {t('security_badges_kicker')}
          </motion.span>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={reveal}
            className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white"
          >
            {t('security_badges_title')}
          </motion.h2>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {BADGES.map((badge, index) => (
            <motion.div
              key={badge.titleKey}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 sm:p-7 hover-tilt"
            >
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary-500/5 dark:bg-primary-600/10 blur-2xl" />
              <div className="relative z-10 flex flex-col items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  {badge.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
                  {t(badge.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {t(badge.descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SecurityBadges;
