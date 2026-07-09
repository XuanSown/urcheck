import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FaqHero } from '@/components/faq/FaqHero';
import { FaqList } from '@/components/faq/FaqList';
import { FaqContact } from '@/components/faq/FaqContact';

export const metadata = {
  title: 'Câu hỏi thường gặp — ur check',
  description: 'Những câu hỏi phổ biến từ người dùng và thương hiệu về urcheck — nền tảng xác thực hàng thật bằng mã QR.',
};

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        <FaqHero />
        <FaqList />
        <FaqContact />
      </main>

      <Footer />
    </div>
  );
}
