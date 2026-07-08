'use client';

import { useState, FormEvent } from 'react';
import { validatePasswordComplexity } from '@/lib/password-validation';
import { useLocale } from '@/components/I18nProvider';

type Step = 'request' | 'reset';

export default function ForgotPasswordPage() {
  const { t, locale } = useLocale();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handleRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/customer/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { success: boolean; message?: string; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error || 'Gửi yêu cầu thất bại');
      } else {
        setMessage(data.message || 'Đã gửi yêu cầu');
        setStep('reset');
      }
    } catch (err) {
      setError('Không thể kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPasswordErrors([]);

    const validation = validatePasswordComplexity(newPassword);
    if (!validation.valid) {
      setPasswordErrors(validation.errors);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/customer/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = (await res.json()) as { success: boolean; message?: string; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error || 'Đặt lại mật khẩu thất bại');
      } else {
        window.location.href = '/customer/login';
      }
    } catch (err) {
      setError('Không thể kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === 'request'
                ? (t('auth_forgot_title') || 'Quên mật khẩu')
                : (t('auth_reset_title') || 'Đặt lại mật khẩu')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {step === 'request'
                ? (t('auth_forgot_subtitle') || 'Nhập email để nhận mã OTP')
                : (t('auth_reset_subtitle') || 'Nhập OTP và mật khẩu mới')}
            </p>
          </div>

          {step === 'request' ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <button
                disabled={isLoading}
                className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white hover:bg-primary-700 disabled:opacity-70"
              >
                {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Mã OTP</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    const v = validatePasswordComplexity(e.target.value);
                    setPasswordErrors(v.valid ? [] : v.errors);
                  }}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
                {passwordErrors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {passwordErrors.map((err) => (
                      <li key={err} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="font-bold">&bull;</span> {err}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <button
                disabled={isLoading}
                className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white hover:bg-primary-700 disabled:opacity-70"
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}

          {message && <p className="mt-4 text-sm text-green-700 dark:text-green-400">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>}

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth_has_account') || 'Đã có tài khoản?'}{' '}
            <a href="/customer/login" className="text-primary-600 hover:underline">
              {t('auth_login_btn') || 'Đăng nhập'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
