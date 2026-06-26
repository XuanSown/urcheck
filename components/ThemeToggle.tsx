'use client';

import type { ReactElement } from 'react';
import { useTheme, type Theme } from './ThemeProvider';
import { cn } from '@/lib/utils';

const OPTIONS: Array<{ value: Theme; label: string; icon: ReactElement }> = [
  {
    value: 'light',
    label: 'Sáng',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'Hệ thống',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Tối',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    ),
  },
];

/**
 * Three-state theme toggle (light / system / dark).
 * Use the `variant` prop to choose between:
 *  - "iconOnly": a compact icon button that cycles through themes (good for header)
 *  - "segmented": a 3-button segmented control (good for admin topbar)
 */
export function ThemeToggle({
  variant = 'iconOnly',
  className,
}: {
  variant?: 'iconOnly' | 'segmented';
  className?: string;
}) {
  const { theme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
          className
        )}
        role="group"
        aria-label="Chế độ giao diện"
      >
        {OPTIONS.map(opt => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              aria-pressed={active}
              title={opt.label}
              className={cn(
                'inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                active
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {opt.icon}
            </button>
          );
        })}
      </div>
    );
  }

  // iconOnly — a single button that shows the NEXT theme icon (what
  // clicking will do) with a tooltip explaining current state.
  const currentIndex = OPTIONS.findIndex(o => o.value === theme);
  const nextOption = OPTIONS[(currentIndex + 1) % OPTIONS.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(nextOption.value)}
      title={`Giao diện: ${theme} (bấm để chuyển sang ${nextOption.value})`}
      aria-label="Chuyển chế độ giao diện"
      className={cn(
        'inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors',
        'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        className
      )}
    >
      {/* Show the icon of the NEXT theme as a hint of what will happen */}
      {nextOption.icon}
    </button>
  );
}