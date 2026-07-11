'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

export interface SupportFormData {
  slug: string;
  titleVi: string;
  titleEn: string;
  bodyVi?: string;
  bodyEn?: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
  order: number;
}

interface SupportFormProps {
  articleId?: string;
  initialData?: Partial<SupportFormData> | null;
  submitting?: boolean;
}

export default function SupportForm({ articleId, initialData, submitting = false }: SupportFormProps) {
  const router = useRouter();
  const isEditing = !!articleId;

  const [formData, setFormData] = useState<SupportFormData>({
    slug: '',
    titleVi: '',
    titleEn: '',
    bodyVi: '',
    bodyEn: '',
    category: '',
    status: 'PUBLISHED',
    order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!initialData) return;
    (async () => {
      setFormData({
        slug: initialData.slug || '',
        titleVi: initialData.titleVi || '',
        titleEn: initialData.titleEn || '',
        bodyVi: initialData.bodyVi || '',
        bodyEn: initialData.bodyEn || '',
        category: initialData.category || '',
        status: initialData.status || 'PUBLISHED',
        order: initialData.order ?? 0,
      });
    })();
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
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
    if (!formData.category.trim()) {
      setError('Vui lòng nhập danh mục');
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
      const url = articleId ? `/api/admin/support/${articleId}` : '/api/admin/support';
      const method = articleId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lưu thất bại');

       setSuccess('Lưu bài viết hỗ trợ thành công!');
       setTimeout(() => router.push('/admin/support'), 1200);
     } catch (err: unknown) {
       setError(err instanceof Error ? err.message : String(err));
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
            {isEditing ? 'Chỉnh sửa bài viết hỗ trợ' : 'Thêm bài viết hỗ trợ'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? 'Cập nhật nội dung bài viết hỗ trợ' : 'Điền đầy đủ thông tin bài viết hỗ trợ'}
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
            <label className={labelClass}>Danh mục <span className="text-red-500">*</span></label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Thứ tự</label>
            <input type="number" name="order" value={formData.order} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <MarkdownEditor
              label="Nội dung (VI)"
              value={formData.bodyVi ?? ''}
              onChange={(v) => setFormData((prev) => ({ ...prev, bodyVi: v }))}
              placeholder="Viết nội dung bài viết bằng Markdown…"
              rows={10}
            />
          </div>
          <div className="md:col-span-2">
            <MarkdownEditor
              label="Nội dung (EN)"
              value={formData.bodyEn ?? ''}
              onChange={(v) => setFormData((prev) => ({ ...prev, bodyEn: v }))}
              placeholder="Write content in Markdown…"
              rows={10}
            />
          </div>
          <div>
            <label className={labelClass}>Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
              <option value="DRAFT">Bản nháp</option>
              <option value="PUBLISHED">Xuất bản</option>
            </select>
          </div>
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
