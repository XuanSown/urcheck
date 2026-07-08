import { Metadata } from 'next';
import { CustomerLoginForm } from '@/components/CustomerLoginForm';

export const metadata: Metadata = {
  title: 'Đăng ký',
};

export default function CustomerRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Đăng ký
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tạo tài khoản để lưu sản phẩm và nhận thông báo hạn sử dụng
            </p>
          </div>
          <CustomerLoginForm mode="register" />
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Đã có tài khoản?{' '}
            <a href="/customer/login" className="text-primary-600 hover:underline">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
