import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
}

export function Card({ className, children, glass = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-500',
        'hover:shadow-2xl hover:border-primary-200 dark:hover:border-primary-800',
        glass && 'glass',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: Omit<CardProps, 'glass'>) {
  return (
    <div className={cn('px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: Omit<CardProps, 'glass'>) {
  return (
    <div className={cn('px-4 sm:px-6 py-3 sm:py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: Omit<CardProps, 'glass'>) {
  return (
    <div className={cn('px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: Omit<CardProps, 'glass'>) {
  return (
    <h3 className={cn('font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  );
}
