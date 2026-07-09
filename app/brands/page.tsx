import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BrandsHero } from '@/components/brands/BrandsHero';
import { BrandsTrusted } from '@/components/brands/BrandsTrusted';
import { BrandsUseCases } from '@/components/brands/BrandsUseCases';
import { BrandsMetrics } from '@/components/brands/BrandsMetrics';
import { BrandsCta } from '@/components/brands/BrandsCta';

export const metadata = {
  title: 'Dành cho thương hiệu — ur check',
  description: 'Bảo vệ thương hiệu của bạn khỏi hàng giả với mã QR xác thực từ urcheck.',
};

export default function BrandsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        <BrandsHero />
        <BrandsTrusted />
        <BrandsUseCases />
        <BrandsMetrics />
        <BrandsCta />
      </main>

      <Footer />
    </div>
  );
}
