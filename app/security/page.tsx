import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SecurityHero } from '@/components/security/SecurityHero';
import { SecurityBadges } from '@/components/security/SecurityBadges';
import { SecurityHow } from '@/components/security/SecurityHow';
import { SecurityStats } from '@/components/security/SecurityStats';
import { SecurityCta } from '@/components/security/SecurityCta';

export const metadata = {
  title: 'Bảo mật — ur check',
  description: 'urcheck bảo vệ dữ liệu từng lớp: mã hóa, tuân thủ và mã QR chống giả mạo.',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        <SecurityHero />
        <SecurityBadges />
        <SecurityHow />
        <SecurityStats />
        <SecurityCta />
      </main>

      <Footer />
    </div>
  );
}
