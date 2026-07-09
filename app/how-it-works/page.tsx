import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HowHero } from '@/components/how/HowHero';
import { HowSteps } from '@/components/how/HowSteps';
import { HowDemo } from '@/components/how/HowDemo';
import { HowCta } from '@/components/how/HowCta';

export const metadata = {
  title: 'Cách hoạt động — ur check',
  description: 'Chỉ 3 bước để xác thực nguồn gốc sản phẩm bằng mã QR — minh bạch trong tích tắc.',
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        <HowHero />
        <HowSteps />
        <HowDemo />
        <HowCta />
      </main>

      <Footer />
    </div>
  );
}
