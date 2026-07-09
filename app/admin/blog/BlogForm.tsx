'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

export interface BlogFormData {
  slug: string;
  titleVi: string;
  titleEn: string;
  excerptVi?: string;
  excerptEn?: string;
  bodyVi?: string;
  bodyEn?: string;
  coverUrl?: string;
  author?: string;
  status: 'DRAFT' | 'PUBLISHED';
}

interface BlogFormProps {
  postId?: string;
  initialData?: Partial<BlogFormData> | null;
  submitting?: boolean;
}

export default function BlogForm({ postId, initialData, submitting = false }: BlogFormProps) {
  const router = useRouter();
  const isEditing = !!postId;

  const [formData, setFormData] = useState<BlogFormData>({
    slug: '',
    titleVi: '',
    titleEn: '',
    excerptVi: '',
    excerptEn: '',
    bodyVi: '',
    bodyEn: '',
    coverUrl: '',
    author: '',
    status: 'DRAFT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        slug: initialData.slug || '',
        titleVi: initialData.titleVi || '',
        titleEn: initialData.titleEn || '',
        excerptVi: initialData.excerptVi || '',
        excerptEn: initialData.excerptEn || '',
        bodyVi: initialData.bodyVi || '',
        bodyEn: initialData.bodyEn || '',
        coverUrl: initialData.coverUrl || '',
        author: initialData.author || '',
        status: initialData.status || 'DRAFT',
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    if (!formData.slug.trim()) {
      setError('Vui lòng nhập slug');
      return false;
    }
    if (!formData.titleVi.trim()) {
      setError('Vui lòng nhập tiêu đề (VI)');
      return false;
    }
    if (!formData.titleEn.trim()) {
      setError('Vui lòng nhập tiêu đề (EN)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (statusOverride?: 'DRAFT' | 'PUBLISHED') => {
    setError(null);
    const status = statusOverride ?? formData.status;
    const payload = { ...formData, status };
    if (!validate()) return;

    setLoading(true);
    try {
      const url = postId ? `/api/admin/blog/${postId}` : '/api/admin/blog';
      const method = postId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lưu thất bại');

      setSuccess('Lưu bài viết thành công!');
      setTimeout(() => router.push('/admin/blog'), 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? 'Cập nhật nội dung bài viết' : 'Điền đầy đủ thông tin bài viết'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </Card>
      )}
      {success && (
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30">
          <p className="text-green-700 dark:text-green-400">{success}</p>
        </Card>
      )}

      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Slug <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              disabled={isEditing}
              placeholder="vi-du-bai-viet"
              className={inputClass + (isEditing ? ' opacity-60' : '')}
            />
          </div>
          <div>
            <label className={labelClass}>Tiêu đề (VI) <span className="text-red-500">*</span></label>
            <input type="text" name="titleVi" value={formData.titleVi} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tiêu đề (EN) <span className="text-red-500">*</span></label>
            <input type="text" name="titleEn" value={formData.titleEn} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tác giả</label>
            <input type="text" name="author" value={formData.author} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Ảnh bìa (URL)</label>
            <input type="text" name="coverUrl" value={formData.coverUrl} onChange={handleChange} placeholder="https://..." className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Tóm tắt (VI)</label>
            <textarea name="excerptVi" value={formData.excerptVi} onChange={handleChange} rows={2} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Tóm tắt (EN)</label>
            <textarea name="excerptEn" value={formData.excerptEn} onChange={handleChange} rows={2} className={inputClass} />
          </div>
        </div>

        <div>
          <MarkdownEditor
            label="Nội dung (VI)"
            value={formData.bodyVi ?? ''}
            onChange={(v) => setFormData((prev) => ({ ...prev, bodyVi: v }))}
            placeholder="Viết nội dung bài viết bằng Markdown…"
            rows={12}
          />
        </div>
        <div>
          <MarkdownEditor
            label="Nội dung (EN)"
            value={formData.bodyEn ?? ''}
            onChange={(v) => setFormData((prev) => ({ ...prev, bodyEn: v }))}
            placeholder="Write content in Markdown…"
            rows={12}
          />
        </div>

        <div>
          <label className={labelClass}>Trạng thái</label>
          <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Xuất bản</option>
          </select>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
        <Button variant="secondary" onClick={() => handleSubmit('DRAFT')} loading={loading || submitting} disabled={loading}>
          Lưu nháp
        </Button>
        <Button onClick={() => handleSubmit('PUBLISHED')} loading={loading || submitting} disabled={loading}>
          {isEditing ? 'Cập nhật' : 'Xuất bản'}
        </Button>
      </div>
    </div>
  );
}
