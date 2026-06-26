'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Honor ?redirect=... if it points to an internal admin path;
        // otherwise fall back to the dashboard. This prevents redirect loops
        // when middleware redirected the user here with a deep link.
        const rawRedirect = searchParams.get('redirect') || '/admin';
        const safeRedirect =
          rawRedirect.startsWith('/admin') && !rawRedirect.startsWith('/admin/login')
            ? rawRedirect
            : '/admin';
        router.push(safeRedirect);
        router.refresh();
      } else {
        setError(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối, vui lòng thử lại');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-stone-light dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary-600">urcheck</h1>
            <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-6">
            Đăng nhập Admin
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="Nhập tên đăng nhập"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="Nhập mật khẩu"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm transition-colors">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tài khoản mặc định:</p>
          <p className="text-gray-600 dark:text-gray-400">Username: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">admin</code></p>
          <p className="text-gray-600 dark:text-gray-400">Password: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">admin123</code></p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
