'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { validatePasswordComplexity } from '@/lib/password-validation';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/components/I18nProvider';

type Mode = 'login' | 'register';

export function CustomerLoginForm({ mode = 'login' }: { mode?: Mode }) {
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const isLogin = mode === 'login';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPasswordErrors([]);
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/customer/login' : '/api/customer/register';

      if (!isLogin) {
        const validation = validatePasswordComplexity(password);
        if (!validation.valid) {
          setPasswordErrors(validation.errors);
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError(t('auth_password_mismatch') || 'Mật khẩu xác nhận không khớp');
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Đã xảy ra lỗi');
        return;
      }

      if (isLogin) {
        window.location.href = '/';
      } else {
        window.location.href = '/customer/login';
      }
    } catch {
      setError(t('auth_conn_error') || 'Không thể kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('auth_email_label')}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('auth_password_label')}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (!isLogin) {
              const v = validatePasswordComplexity(e.target.value);
              setPasswordErrors(v.valid ? [] : v.errors);
            }
          }}
          required
          minLength={8}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {!isLogin && passwordErrors.length > 0 && (
          <ul className="mt-2 space-y-1">
            {passwordErrors.map((err) => (
              <li key={err} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <span className="font-bold">&bull;</span> {err}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isLogin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('auth_confirm_password_label')}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={isLoading}
        disabled={isLoading}
      >
        {isLogin ? t('auth_login_btn') : t('auth_register_btn')}
      </Button>
      {isLogin && (
        <p className="text-center text-sm mt-3">
          <a href="/customer/forgot-password" className="text-primary-600 hover:underline">
            {t('auth_forgot_password_link')}
          </a>
        </p>
      )}
    </motion.form>
  );
}
