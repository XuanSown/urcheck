'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { type Locale } from '@/lib/i18n';

function pickLocale(locale: Locale) {
  return (vi: string, en: string) => (locale === 'en' ? en : vi);
}

function estimateReadMinutes(body?: string | null): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  const vnChars = body.replace(/\s/g, '').length;
  return Math.max(1, Math.round((words + vnChars / 6) / 200));
}

export type BlogPostPreview = {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  excerptVi: string | null;
  excerptEn: string | null;
  coverUrl: string | null;
  author: string | null;
  bodyVi: string | null;
  bodyEn: string | null;
  publishedAt: Date | null;
};

export function BlogContent({
  locale,
  posts,
}: {
  locale: Locale;
  posts: BlogPostPreview[];
}) {
  const reduced = useReducedMotion();
  const pick = pickLocale(locale);

  const title = pick('Câu chuyện & kiến thức', 'Stories & insights');
  const subtitle = pick(
    'Chia sẻ về chống hàng giả, làm đẹp và bảo vệ thương hiệu.',
    'Sharing on anti-counterfeit, beauty and brand protection.'
  );

  return (
    <>
      {/* Hero */}
      <section className="relative text-center mb-14 grain-overlay rounded-3xl py-12 px-4 overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-6 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl" />
        <motion.span
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block text-xs sm:text-sm font-medium tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase mb-4"
        >
          BLOG
        </motion.span>
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      </section>

      {posts.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z M14 4v6h6" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {pick('Chưa có bài viết nào.', 'No posts yet.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => {
            const postTitle = pick(post.titleVi, post.titleEn);
            const excerpt = pick(post.excerptVi || '', post.excerptEn || '');
            const minutes = estimateReadMinutes(pick(post.bodyVi || '', post.bodyEn || ''));
            return (
              <motion.div
                key={post.id}
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/blog/${post.slug}`} className="group block h-full hover-tilt">
                  <article className="glass rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 h-full flex flex-col transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-700">
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-primary-100 to-primary-300 dark:from-primary-900/40 dark:to-gray-800 overflow-hidden">
                      {post.coverUrl ? (
                        <img
                          src={post.coverUrl}
                          alt={postTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl font-bold text-primary-600/30 dark:text-primary-400/30">
                            {postTitle.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {postTitle}
                      </h2>
                      {excerpt && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {excerpt}
                        </p>
                      )}
                      <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{post.author ? `${pick('Bởi', 'By')} ${post.author}` : ''}</span>
                        <span>
                          {minutes} {pick('phút đọc', 'min read')}
                        </span>
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400">
                        {pick('Đọc tiếp', 'Read more')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}
