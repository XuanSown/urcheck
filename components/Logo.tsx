'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from './ThemeProvider';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
}

/**
 * Logo component that renders the UR Check logo.
 */
export function Logo({ className = '', size = 'md', variant = 'dark' }: LogoProps) {
  const { resolved } = useTheme();
  const sizeMap = {
    sm: { width: 56, height: 20, imgClass: 'h-5 w-auto' },
    md: { width: 80, height: 28, imgClass: 'h-7 sm:h-8 w-auto' },
    lg: { width: 100, height: 35, imgClass: 'h-8 sm:h-10 w-auto' },
  };

  const { width, height, imgClass } = sizeMap[size];

  // Use logo-main.png (dark) for light backgrounds
  // Use logo-white.png for dark backgrounds
  const logoSrc = resolved === 'dark' ? '/images/logo-white.png' : '/images/logo-main.png';

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Image
        src={logoSrc}
        alt="ur check"
        width={width}
        height={height}
        className={`object-contain ${imgClass}`}
        style={{
          width: 'auto',
          height: 'auto',
        }}
        priority
      />
    </div>
  );
}
