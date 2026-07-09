import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AboutHero } from '@/components/about/AboutHero';
import { Marquee } from '@/components/about/Marquee';
import { StorySection } from '@/components/about/StorySection';
import { MissionSection } from '@/components/about/MissionSection';
import { StatsSection } from '@/components/about/StatsSection';
import { CTASection } from '@/components/about/CTASection';

export const metadata = {
  title: 'Về chúng tôi — ur check',
  description: 'Câu chuyện, sứ mệnh và những con số về urcheck — nền tảng xác thực hàng thật bằng mã QR.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        <AboutHero />
        <Marquee />
        <StorySection />
        <MissionSection />
        <StatsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
