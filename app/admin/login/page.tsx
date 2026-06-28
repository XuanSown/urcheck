'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function AuthForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // View states: login -> forgot_email -> forgot_otp -> forgot_reset
  const [view, setView] = useState<'login' | 'forgot_email' | 'forgot_otp' | 'forgot_reset'>('login');
  
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot password state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Handlers ---

  const handleLogin = async (e: React.FormEvent) => {
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
        const rawRedirect = searchParams.get('redirect') || '/admin';
        const safeRedirect = rawRedirect.startsWith('/admin') && !rawRedirect.startsWith('/admin/login')
            ? rawRedirect : '/admin';
        router.push(safeRedirect);
        router.refresh();
      } else {
        setError(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setView('forgot_otp');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app we might verify OTP here first, but to save steps,
    // we can verify OTP and Reset Password in one API call.
    // So here we just move to the next screen.
    if (otp.length === 6) {
      setError(null);
      setView('forgot_reset');
    } else {
      setError('Vui lòng nhập đủ 6 số OTP');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccessMsg('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
        setView('login');
        setPassword('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderers ---

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-stone-light dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 transition-colors">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary-600">urcheck</h1>
            <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 transition-colors overflow-hidden relative">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
              {successMsg}
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* --- VIEW: LOGIN --- */}
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-6">
                  Đăng nhập Admin
                </h2>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tên đăng nhập</label>
                    <input type="text" required value={username} onChange={e => setUsername(e.target.value)} disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500" placeholder="Nhập tên đăng nhập" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</label>
                      <button type="button" onClick={() => { setView('forgot_email'); setError(null); setSuccessMsg(null); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Quên mật khẩu?
                      </button>
                    </div>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500" placeholder="Nhập mật khẩu" />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* --- VIEW: FORGOT PASSWORD (EMAIL) --- */}
            {view === 'forgot_email' && (
              <motion.div key="forgot_email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">Quên mật khẩu</h2>
                <p className="text-sm text-gray-500 text-center mb-6">Nhập email tài khoản admin để nhận mã OTP khôi phục.</p>
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500" placeholder="Nhập email..." />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Đang gửi mã...' : 'Gửi mã OTP'}
                  </Button>
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => setView('login')} className="text-sm text-gray-500 hover:text-gray-700">Quay lại đăng nhập</button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* --- VIEW: FORGOT PASSWORD (OTP) --- */}
            {view === 'forgot_otp' && (
              <motion.div key="forgot_otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">Nhập mã xác thực</h2>
                <p className="text-sm text-gray-500 text-center mb-6">Mã OTP 6 số đã được gửi tới <strong>{email}</strong>.</p>
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mã OTP</label>
                    <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 text-center text-xl tracking-[0.5em] font-bold" placeholder="------" />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading || otp.length < 6}>
                    Tiếp tục
                  </Button>
                  <div className="text-center mt-4 flex justify-between px-2">
                    <button type="button" onClick={() => setView('forgot_email')} className="text-sm text-gray-500 hover:text-gray-700">Đổi email</button>
                    <button type="button" onClick={() => setView('login')} className="text-sm text-gray-500 hover:text-gray-700">Hủy</button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* --- VIEW: FORGOT PASSWORD (RESET) --- */}
            {view === 'forgot_reset' && (
              <motion.div key="forgot_reset" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">Đặt lại mật khẩu</h2>
                <p className="text-sm text-gray-500 text-center mb-6">Tạo mật khẩu mới cho tài khoản của bạn.</p>
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu mới</label>
                    <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500" placeholder="Nhập mật khẩu mới" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Xác nhận mật khẩu</label>
                    <input type="password" required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500" placeholder="Nhập lại mật khẩu" />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Đang lưu...' : 'Xác nhận đổi mật khẩu'}
                  </Button>
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => setView('login')} className="text-sm text-gray-500 hover:text-gray-700">Hủy bỏ</button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForms />
    </Suspense>
  );
}
