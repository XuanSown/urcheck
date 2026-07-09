import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LegalDoc } from '@/components/legal/LegalDoc';

export const metadata = {
  title: 'Chính sách bảo mật — ur check',
  description: 'Chính sách bảo mật của urcheck — cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1">
        <LegalDoc kind="privacy" />
      </main>
      <Footer />
    </div>
  );
}
