import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  children: React.ReactNode;
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-green-900/20 text-green-600 border-green-800/30 backdrop-blur-sm',
    error: 'bg-red-900/20 text-red-500 border-red-800/30 backdrop-blur-sm',
    warning: 'bg-amber-900/20 text-amber-600 border-amber-800/30 backdrop-blur-sm',
    info: 'bg-primary-900/10 text-primary-600 border-primary-800/20 backdrop-blur-sm',
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
