'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

interface CounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function Counter({
  value,
  suffix = '',
  decimals = 0,
  duration = 2,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      const id = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(id);
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, reducedMotion, value, duration]);

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {formatted}
      {suffix}
    </span>
  );
}
