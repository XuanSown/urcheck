'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/components/I18nProvider';
import { useCustomerAuth } from '@/components/CustomerAuth';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { customer, loading, logout } = useCustomerAuth();
  const { t } = useLocale();

  const lastScrollY = React.useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/discover', label: t('feed_title') },
    { href: '/how-it-works', label: t('nav_how_it_works') },
    { href: '/brands', label: t('nav_brands') },
    { href: '/contact', label: t('nav_contact') },
  ];

  const authLinks = customer
    ? []
    : [
        { href: '/customer/login', label: t('auth_login_btn') || 'Đăng nhập', variant: 'ghost' as const },
        { href: '/customer/register', label: t('auth_register_btn') || 'Đăng ký', variant: 'solid' as const },
      ];

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out',
        isHidden ? '-translate-y-[140%]' : 'translate-y-0',
        className
      )}
    >
      <div className="px-3 sm:px-4 pt-3">
        <div className="relative mx-auto max-w-7xl">
          {/* Liquid glass background layer */}
          <div className="liquid-glass absolute inset-0 rounded-2xl overflow-hidden" aria-hidden="true">
            <div className="liquid-sheen" />
            {/* soft amber glow corner for brand warmth */}
            <div className="pointer-events-none absolute -top-10 -right-6 h-32 w-32 rounded-full bg-primary-500/20 blur-3xl" />
          </div>

          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 py-2.5 sm:py-3">
          {/* Left: empty spacer on mobile, nav links on desktop */}
          <div className="flex items-center gap-4 justify-self-start">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                className="hidden md:block"
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
          </div>

          {/* Center: logo */}
          <Link href="/" className="flex items-center gap-2 group justify-self-center">
            <motion.div
              whileHover={{ scale: 0.96 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative"
            >
              <Logo size="sm" variant="dark" className="group-hover:opacity-80 transition-opacity duration-300" />
            </motion.div>
          </Link>

          {/* Right: auth (desktop) + mobile toggle */}
          <div className="flex items-center gap-2 justify-self-end">
            <div className="hidden md:flex items-center gap-4">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              ) : customer ? (
                <div
                  className="relative flex items-center"
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                      {customer.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">{customer.email}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-2 overflow-hidden"
                      >
                        <Link
                          href="/customer/routines"
                          className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          Lịch trình
                        </Link>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          {t('auth_logout_btn') || 'Đăng xuất'}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/customer/login"
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {t('auth_login_btn') || 'Đăng nhập'}
                  </Link>
                  <Link
                    href="/customer/register"
                    className="text-sm font-medium px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200"
                  >
                    {t('auth_register_btn') || 'Đăng ký'}
                  </Link>
                </div>
              )}
            </div>

            <button
              className="md:hidden relative z-10 p-2.5 -mr-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 relative flex flex-col justify-center items-center">
                <motion.span
                  className="absolute w-5 h-[1.5px] bg-current rounded-full"
                  animate={isMobileMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
                <motion.span
                  className="absolute w-5 h-[1.5px] bg-current rounded-full"
                  animate={isMobileMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
              exit={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="liquid-glass md:hidden mt-2 overflow-hidden rounded-2xl"
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

                <div className="border-t border-gray-200/60 dark:border-gray-800/60 mt-2 pt-2">
                  {loading ? (
                    <div className="px-4 py-3">
                      <div className="w-24 h-4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    </div>
                  ) : customer ? (
                    <>
                      <Link
                        href="/customer/routines"
                        className="block px-4 py-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 rounded-xl transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Lịch trình Skincare
                      </Link>
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                        {customer.email}
                      </div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                      >
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                        >
                          {t('auth_logout_btn') || 'Đăng xuất'}
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/customer/login"
                        className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 rounded-xl transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t('auth_login_btn') || 'Đăng nhập'}
                      </Link>
                      <Link
                        href="/customer/register"
                        className="block px-4 py-3 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 text-center rounded-xl transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t('auth_register_btn') || 'Đăng ký'}
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
    </header>
  );
}
