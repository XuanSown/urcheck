'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use ref to track scroll position without triggering re-renders
  const lastScrollY = React.useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 10);
      
      // Hide when scrolling down past 100px, show when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHidden(true);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHidden(false);
      }
      
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { href: '#how-it-works', label: 'Cách hoạt động' },
    { href: '#support', label: 'Hỗ trợ' },
    { href: '#contact', label: 'Liên hệ' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        isScrolled ? 'py-2 sm:py-3' : 'py-3 sm:py-4',
        isHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto',
        className
      )}
    >
      {/* Glass background layer — solid enough to fully mask content behind */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-500',
          isScrolled
            ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-b border-gray-200/60 dark:border-gray-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.08)]'
            : 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200/40 dark:border-gray-800/40'
        )}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo — smaller */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 0.96 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative"
            >
              <Logo size="sm" variant="dark" className="group-hover:opacity-80 transition-opacity duration-300" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
              >
                <Link
                  href={link.href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 link-underline"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative z-10 p-2.5 -mr-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 relative flex flex-col justify-center items-center">
              <motion.span
                className="absolute w-5 h-[1.5px] bg-current rounded-full"
                animate={isMobileMenuOpen
                  ? { rotate: 45, y: 0 }
                  : { rotate: 0, y: -5 }
                }
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              />
              <motion.span
                className="absolute w-5 h-[1.5px] bg-current rounded-full"
                animate={isMobileMenuOpen
                  ? { rotate: -45, y: 0 }
                  : { rotate: 0, y: 5 }
                }
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu — full glass overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
              exit={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden mt-2 overflow-hidden rounded-2xl bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl"
            >
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 rounded-xl transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
