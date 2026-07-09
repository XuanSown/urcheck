'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BlogForm, { type BlogFormData } from '@/app/admin/blog/BlogForm';

export default function EditBlogPostPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [initialData, setInitialData] = useState<Partial<BlogFormData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/blog/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInitialData(data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return <BlogForm postId={id} initialData={initialData} />;
}
