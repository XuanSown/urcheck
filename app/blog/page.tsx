import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DEFAULT_LOCALE, readLocaleFromCookies } from '@/lib/i18n';
import { BlogContent, type BlogPostPreview } from '@/components/blog/BlogContent';

export const metadata: Metadata = {
  title: 'Blog — ur check',
  description: 'Câu chuyện & kiến thức về chống hàng giả, làm đẹp và bảo vệ thương hiệu.',
};

export default async function BlogPage() {
  const cookieStore = await cookies();
  const locale = readLocaleFromCookies(cookieStore.get('urcheck_locale')?.value, DEFAULT_LOCALE);

  let posts: BlogPostPreview[] = [];
  try {
    const result = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        titleVi: true,
        titleEn: true,
        excerptVi: true,
        excerptEn: true,
        coverUrl: true,
        author: true,
        bodyVi: true,
        bodyEn: true,
        publishedAt: true,
      },
    });
    posts = result as BlogPostPreview[];
  } catch {
    // Table may not exist yet (migration not applied) — show empty state gracefully.
    posts = [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <BlogContent locale={locale} posts={posts} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
