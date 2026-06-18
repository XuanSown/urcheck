'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn('w-full py-4 px-4 sm:px-6 lg:px-8', className)}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative h-10 w-auto">
            <Image
              src="/images/logo-dark.png"
              alt="ur check"
              width={120}
              height={40}
              className="object-contain h-10 w-auto"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </div>
        </Link>
        <nav className="hidden sm:flex items-center space-x-6">
          <Link
            href="#how-it-works"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Cách hoạt động
          </Link>
          <Link
            href="#support"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Hỗ trợ
          </Link>
          <Link
            href="#contact"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Liên hệ
          </Link>
        </nav>
      </div>
    </header>
  );
}
