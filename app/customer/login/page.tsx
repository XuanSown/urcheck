import { Metadata } from 'next';
import { CustomerLoginForm } from '@/components/CustomerLoginForm';

export const metadata: Metadata = {
  title: 'Đăng nhập',
};

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Đăng nhập
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Quản lý sản phẩm và theo dõi hạn sử dụng của bạn
            </p>
          </div>
          <CustomerLoginForm mode="login" />
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Chưa có tài khoản?{' '}
            <a href="/customer/register" className="text-primary-600 hover:underline">
              Đăng ký
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
