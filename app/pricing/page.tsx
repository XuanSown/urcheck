import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PricingHero } from '@/components/pricing/PricingHero';
import { PricingToggle } from '@/components/pricing/PricingToggle';
import { PricingRoi } from '@/components/pricing/PricingRoi';
import { PricingCta } from '@/components/pricing/PricingCta';

export const metadata: Metadata = {
  title: 'Bảng giá — ur check',
  description:
    'Bảng giá urcheck: gói Miễn phí, Pro và Enterprise để bảo vệ thương hiệu khỏi hàng giả bằng mã QR xác thực.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1">
        <PricingHero />
        <PricingToggle />
        <PricingRoi />
        <PricingCta />
      </main>
      <Footer />
    </div>
  );
}
