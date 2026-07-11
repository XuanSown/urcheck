import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DEFAULT_LOCALE, readLocaleFromCookies } from '@/lib/i18n';
import BlogArticle from '@/components/blog/BlogArticle';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let post = null;
  try {
    post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { titleVi: true, titleEn: true, excerptVi: true, excerptEn: true },
    });
  } catch {
    post = null;
  }
  if (!post) return { title: 'Blog — ur check' };
  return {
    title: `${post.titleVi} — ur check`,
    description: post.excerptVi || undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const locale = readLocaleFromCookies(cookieStore.get('urcheck_locale')?.value, DEFAULT_LOCALE);

  let post = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { slug } });
  } catch {
    post = null;
  }
  if (!post || post.status !== 'PUBLISHED') notFound();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <BlogArticle locale={locale} post={post} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
