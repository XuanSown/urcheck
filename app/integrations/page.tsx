import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { IntegrationsHero } from '@/components/integrations/IntegrationsHero';
import { IntegrationsGrid } from '@/components/integrations/IntegrationsGrid';
import { IntegrationsCta } from '@/components/integrations/IntegrationsCta';

export const metadata: Metadata = {
  title: 'Tích hợp — ur check',
  description:
    'urcheck tích hợp dễ dàng với nền tảng thương mại điện tử và hệ thống ERP phổ biến như Shopify, WooCommerce, Salesforce, ERP, Zapier và Google Sheets.',
};

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1">
        <IntegrationsHero />
        <IntegrationsGrid />
        <IntegrationsCta />
      </main>
      <Footer />
    </div>
  );
}
