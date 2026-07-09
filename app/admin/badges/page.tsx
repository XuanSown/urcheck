'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/admin/PageHeader';
import { useToast } from '@/components/ui/Toast';

interface Badge {
  id: string;
  name: string;
  descriptionVi: string;
  descriptionEn: string;
  icon: string;
  criteriaJson: Record<string, unknown>;
  order: number;
  createdAt: string;
  _count: { customerBadges: number };
}

interface BadgeFormData {
  name: string;
  descriptionVi: string;
  descriptionEn: string;
  icon: string;
  criteriaJson: string;
}

const EMPTY_FORM: BadgeFormData = {
  name: '',
  descriptionVi: '',
  descriptionEn: '',
  icon: '',
  criteriaJson: '{}',
};

export default function BadgesPage() {
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BadgeFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Badge | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/badges');
      const data = await res.json();
      if (data.success) {
        setBadges(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (badge: Badge) => {
    setEditingId(badge.id);
    setForm({
      name: badge.name,
      descriptionVi: badge.descriptionVi,
      descriptionEn: badge.descriptionEn,
      icon: badge.icon,
      criteriaJson: JSON.stringify(badge.criteriaJson ?? {}, null, 2),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError('Vui lòng nhập tên huy hiệu');
      return;
    }
    if (!form.descriptionVi.trim()) {
      setFormError('Vui lòng nhập mô tả tiếng Việt');
      return;
    }
    if (!form.descriptionEn.trim()) {
      setFormError('Vui lòng nhập mô tả tiếng Anh');
      return;
    }
    if (!form.icon.trim()) {
      setFormError('Vui lòng nhập biểu tượng');
      return;
    }

    let parsedCriteria: Record<string, unknown> = {};
    const trimmed = form.criteriaJson.trim();
    if (trimmed && trimmed !== '{}') {
      try {
        const raw = JSON.parse(trimmed);
        if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
          setFormError('Tiêu chí phải là một đối tượng JSON hợp lệ');
          return;
        }
        parsedCriteria = raw as Record<string, unknown>;
      } catch {
        setFormError('Tiêu chí không phải là JSON hợp lệ');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/admin/badges/${editingId}` : '/api/admin/badges';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          descriptionVi: form.descriptionVi.trim(),
          descriptionEn: form.descriptionEn.trim(),
          icon: form.icon.trim(),
          criteriaJson: parsedCriteria,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        toast({
          type: 'success',
          title: editingId ? 'Đã cập nhật huy hiệu' : 'Đã tạo huy hiệu',
        });
        fetchBadges();
      } else {
        setFormError(data.error);
      }
    } catch {
      setFormError('Đã xảy ra lỗi khi lưu huy hiệu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/badges/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBadges(badges.filter((b) => b.id !== deleteTarget.id));
        toast({ type: 'success', title: 'Đã xóa huy hiệu' });
      } else {
        toast({ type: 'error', title: 'Xóa thất bại', description: data.error });
      }
    } catch {
      toast({ type: 'error', title: 'Đã xảy ra lỗi khi xóa' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Huy hiệu"
        description="Quản lý huy hiệu thành tựu"
        action={
          <Button onClick={openCreate} className="min-h-[44px]">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm huy hiệu
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Đang tải...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 dark:text-red-400">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Icon</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số người đạt</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {badges.map((badge) => (
                  <tr key={badge.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{badge.name}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{badge.descriptionVi}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-mono text-xs">
                        {badge.icon || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {badge._count.customerBadges}
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() => openEdit(badge)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm transition-colors min-h-[44px]"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setDeleteTarget(badge)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors min-h-[44px]"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {badges.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      Chưa có huy hiệu nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingId ? 'Chỉnh sửa huy hiệu' : 'Thêm huy hiệu'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800"
              placeholder="Nhập tên huy hiệu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả (Tiếng Việt) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={form.descriptionVi}
              onChange={(e) => setForm({ ...form, descriptionVi: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 resize-none"
              placeholder="Nhập mô tả tiếng Việt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả (Tiếng Anh) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 resize-none"
              placeholder="Enter English description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icon <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 font-mono"
              placeholder="Ví dụ: medal, star, trophy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tiêu chí (JSON)
            </label>
            <textarea
              value={form.criteriaJson}
              onChange={(e) => setForm({ ...form, criteriaJson: e.target.value })}
              rows={4}
              spellCheck={false}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 font-mono text-sm resize-none"
              placeholder='{"type": "scan_count", "threshold": 10}'
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="min-h-[44px]">
              Hủy
            </Button>
            <Button type="submit" loading={isSubmitting} className="min-h-[44px]">
              {editingId ? 'Cập nhật' : 'Tạo huy hiệu'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa huy hiệu"
        description={deleteTarget ? `Bạn có chắc chắn muốn xóa huy hiệu "${deleteTarget.name}"? Hành động này không thể hoàn tác.` : undefined}
        confirmLabel="Xóa"
        danger
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />
    </div>
  );
}
