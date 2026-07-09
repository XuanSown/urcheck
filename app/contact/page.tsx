import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactHero } from '@/components/contact/ContactHero';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata = {
  title: 'Liên hệ — ur check',
  description: 'Để lại thông tin, đội ngũ urcheck sẽ phản hồi sớm nhất.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        <ContactHero />
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
