'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { Locale } from '@/lib/i18n';

export type BlogPostDetail = {
  titleVi: string;
  titleEn: string;
  bodyVi: string | null;
  bodyEn: string | null;
  coverUrl: string | null;
  author: string | null;
  publishedAt: Date | null;
};

export default function BlogArticle({ locale, post }: { locale: Locale; post: BlogPostDetail }) {
  const reduced = useReducedMotion();
  const pick = (vi: string, en: string) => (locale === 'en' ? en : vi);
  const title = pick(post.titleVi, post.titleEn);
  const body = pick(post.bodyVi || '', post.bodyEn || '');
  const paragraphs = body.split(/\n+/).filter((p) => p.trim().length > 0);
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <article>
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:gap-2.5 transition-all mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {pick('Quay lại Blog', 'Back to Blog')}
      </Link>

      <motion.h1
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight"
      >
        {title}
      </motion.h1>

      <div className="mt-4 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        {post.author && (
          <span>
            {pick('Bởi', 'By')} <span className="text-gray-700 dark:text-gray-300">{post.author}</span>
          </span>
        )}
        {dateStr && (
          <>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <time dateTime={post.publishedAt?.toISOString()}>{dateStr}</time>
          </>
        )}
      </div>

      {post.coverUrl && (
        <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <img src={post.coverUrl} alt={title} className="w-full h-auto" />
        </div>
      )}

      <div className="mt-10 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed [&_p]:text-base sm:[&_p]:text-lg">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          <p className="text-gray-500">{pick('Nội dung đang được cập nhật.', 'Content coming soon.')}</p>
        )}
      </div>
    </article>
  );
}
