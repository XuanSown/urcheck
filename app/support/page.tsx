import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DEFAULT_LOCALE, readLocaleFromCookies, type Locale } from '@/lib/i18n';
import SupportList, { type SupportArticleItem } from '@/components/support/SupportList';
import SupportHero from '@/components/support/SupportHero';

export const metadata: Metadata = {
  title: 'Hỗ trợ — ur check',
  description: 'Trung tâm hỗ trợ urcheck: tìm câu trả lời hoặc gửi yêu cầu hỗ trợ.',
};

function pickLocale(locale: Locale) {
  return (vi: string, en: string) => (locale === 'en' ? en : vi);
}

type SupportArticlePreview = {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  bodyVi: string | null;
  bodyEn: string | null;
  category: string;
  order: number;
};

export default async function SupportPage() {
  const cookieStore = await cookies();
  const locale = readLocaleFromCookies(cookieStore.get('urcheck_locale')?.value, DEFAULT_LOCALE);
  const pick = pickLocale(locale);

  let articles: SupportArticlePreview[] = [];
  try {
    articles = await prisma.supportArticle.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        titleVi: true,
        titleEn: true,
        bodyVi: true,
        bodyEn: true,
        category: true,
        order: true,
      },
    });
  } catch {
    // Table may not exist yet (migration not applied) — show empty state gracefully.
    articles = [];
  }

  const grouped = articles.reduce<Record<string, SupportArticleItem[]>>((acc, a) => {
    (acc[a.category] ||= []).push(a);
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  const kicker = pick('TRUNG TÂM HỖ TRỢ', 'HELP CENTER');
  const title = pick('Chúng tôi có thể giúp gì?', 'How can we help?');
  const subtitle = pick(
    'Tìm câu trả lời hoặc gửi yêu cầu hỗ trợ.',
    'Find answers or send a support request.'
  );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SupportHero kicker={kicker} title={title} subtitle={subtitle} />

          <SupportList grouped={grouped} categories={categories} locale={locale} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
