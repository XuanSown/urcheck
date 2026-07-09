import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  children: React.ReactNode;
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/25 dark:text-green-400 dark:border-green-800/40 backdrop-blur-sm',
    error: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/25 dark:text-red-400 dark:border-red-800/40 backdrop-blur-sm',
    warning: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/25 dark:text-amber-400 dark:border-amber-800/40 backdrop-blur-sm',
    info: 'bg-primary-100 text-primary-700 border-primary-300 dark:bg-primary-900/25 dark:text-primary-400 dark:border-primary-800/40 backdrop-blur-sm',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
