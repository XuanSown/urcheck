'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format-utils';

interface SupportArticle {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
  order: number;
  updatedAt: string;
  createdAt: string;
}

export default function AdminSupportPage() {
  const [articles, setArticles] = useState<SupportArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/support');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải dữ liệu');
      setArticles(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => { await fetchArticles(); })();
  }, [fetchArticles]);

  const handleDelete = async (article: SupportArticle) => {
    if (!confirm(`Xóa bài viết "${article.titleVi}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(article.id);
    try {
      const res = await fetch(`/api/admin/support/${article.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa thất bại');
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
      PUBLISHED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    };
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  };

  const statusLabel = (status: string) =>
    status === 'DRAFT' ? 'Nháp' : status === 'PUBLISHED' ? 'Xuất bản' : status;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý bài viết hỗ trợ</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý tất cả bài viết trung tâm hỗ trợ</p>
        </div>
        <Link href="/admin/support/new">
          <Button size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm bài viết
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
          <div className="text-red-700 dark:text-red-400">{error}</div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5m-5 6l-6 2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Chưa có bài viết hỗ trợ</h3>
            <Link href="/admin/support/new">
              <Button>Thêm bài viết</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Tiêu đề</th>
                  <th className="text-left px-4 py-3 font-medium">Danh mục</th>
                  <th className="text-left px-4 py-3 font-medium">Thứ tự</th>
                  <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-medium">Cập nhật</th>
                  <th className="text-right px-4 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {articles.map((article) => (
                  <motion.tr
                    key={article.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{article.titleVi}</div>
                      <div className="text-xs text-gray-400 mt-0.5">/{article.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{article.category}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{article.order}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(article.status)}`}>
                        {statusLabel(article.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {formatDate(article.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/support/${article.id}`}>
                          <Button variant="ghost" size="sm" aria-label="Chỉnh sửa">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(article)}
                          loading={deletingId === article.id}
                          aria-label="Xóa"
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
