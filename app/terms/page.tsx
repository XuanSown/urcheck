import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LegalDoc } from '@/components/legal/LegalDoc';

export const metadata = {
  title: 'Điều khoản dịch vụ — ur check',
  description: 'Điều khoản dịch vụ của urcheck — các quy định áp dụng khi bạn sử dụng nền tảng xác thực sản phẩm.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1">
        <LegalDoc kind="terms" />
      </main>
      <Footer />
    </div>
  );
}
