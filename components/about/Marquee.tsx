'use client';

import { motion, useReducedMotion } from 'framer-motion';

const KEYWORDS = [
  'MINH BẠCH',
  'UY TÍN',
  'CHỐNG HÀNG GIẢ',
  'XÁC THỰC',
  'MIỄN PHÍ',
  'TỐC ĐỘ',
];

function Diamond() {
  return (
    <span
      aria-hidden="true"
      className="mx-6 inline-block h-1.5 w-1.5 rotate-45 bg-primary-500"
    />
  );
}

export function Marquee() {
  const reducedMotion = useReducedMotion();
  const row = (
    <div className="flex shrink-0 items-center">
      {KEYWORDS.map((word) => (
        <span key={word} className="flex items-center">
          <span className="tracking-[0.25em] text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 uppercase">
            {word}
          </span>
          <Diamond />
        </span>
      ))}
    </div>
  );

  if (reducedMotion) {
    return (
      <div className="border-y border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-950 py-4 overflow-hidden">
        <div className="flex justify-center gap-0">{row}</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border-y border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-950 py-4 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <motion.div
        className="flex w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        {row}
        {row}
      </motion.div>
    </div>
  );
}
