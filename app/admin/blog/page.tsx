'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format-utils';

interface BlogPost {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  status: 'DRAFT' | 'PUBLISHED';
  author: string | null;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = useCallback(() => {
    fetch('/api/admin/blog')
      .then((res) => res.json().then((data) => ({ res, data })))
      .then(({ res, data }: { res: Response; data: { data?: BlogPost[]; error?: string } }) => {
        setError(null);
        if (!res.ok) throw new Error(data.error || 'Lỗi tải dữ liệu');
        setPosts(data.data ?? []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Xóa bài viết "${post.titleVi}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(post.id);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa thất bại');
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý bài viết</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý tất cả bài viết blog</p>
        </div>
        <Link href="/admin/blog/new">
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
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z M14 4v6h6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Chưa có bài viết</h3>
            <Link href="/admin/blog/new">
              <Button>Thêm bài viết</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Tiêu đề</th>
                  <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-medium">Cập nhật</th>
                  <th className="text-right px-4 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {posts.map((post) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{post.titleVi}</div>
                      <div className="text-xs text-gray-400 mt-0.5">/{post.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(post.status)}`}>
                        {statusLabel(post.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/blog/${post.id}`}>
                          <Button variant="ghost" size="sm" aria-label="Chỉnh sửa">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post)}
                          loading={deletingId === post.id}
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
