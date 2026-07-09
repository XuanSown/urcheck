'use client';

import { useState } from 'react';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { useLocale } from '@/components/I18nProvider';
import { Button } from '@/components/ui/Button';

const TIME_OPTIONS = [
  { value: 'morning', labelKey: 'routines_morning' },
  { value: 'afternoon', labelKey: 'routines_afternoon' },
  { value: 'evening', labelKey: 'routines_evening' },
  { value: 'night', labelKey: 'routines_night' },
] as const;

type RoutineItemInput = {
  productId: string;
  productName: string;
  brandName?: string;
  imageUrl?: string;
  timeOfDay: string;
  order: number;
  notes?: string;
};

export function RoutineForm({
  routine,
  onClose,
  onSaved,
}: {
  routine?: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { customer } = useCustomerAuth();
  const { t, locale } = useLocale();
  const [title, setTitle] = useState(routine?.title ?? '');
  const [description, setDescription] = useState(routine?.description ?? '');
  const [isPublic, setIsPublic] = useState(routine?.isPublic ?? false);
  const [items, setItems] = useState<RoutineItemInput[]>(
    routine?.items?.length
      ? routine.items.map((it: any) => ({ ...it }))
      : [{ productId: '', productName: '', timeOfDay: 'night', order: 0 }]
  );
  const [saving, setSaving] = useState(false);

  const updateItem = (idx: number, patch: Partial<RoutineItemInput>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addItem = () =>
    setItems((prev) => [...prev, { productId: '', productName: '', timeOfDay: 'night', order: prev.length }]);

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setSaving(true);
    try {
      const url = routine?.id ? `/api/customer/routines/${routine.id}` : '/api/customer/routines';
      const method = routine?.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        // ponytail: dùng locale từ I18nProvider thay vì hardcode 'vi'
        headers: { 'Content-Type': 'application/json', 'Accept-Language': locale },
        body: JSON.stringify({ title, description, isPublic, items }),
      });
      const data = await res.json();
      if (data.success) onSaved();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{routine ? t('routines_edit_title') : t('routines_create_btn')}</h2>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t('routines_name_label')}</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
        required
      />

      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t('routines_desc_label')}</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
        rows={2}
      />

      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4" />
        <span className="text-sm text-gray-700 dark:text-gray-300">{isPublic ? t('routines_public_label') : t('routines_private_label')}</span>
      </label>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sản phẩm</span>
          <button type="button" onClick={addItem} className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 rounded min-h-[44px] inline-flex items-center">
            + Thêm
          </button>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
            <input
              value={item.productName}
              onChange={(e) => updateItem(idx, { productName: e.target.value })}
              placeholder="Tên sản phẩm"
              className="col-span-5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
              required
            />
            <select
              value={item.timeOfDay}
              onChange={(e) => updateItem(idx, { timeOfDay: e.target.value })}
              className="col-span-3 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
            >
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
              ))}
            </select>
            <input
              type="number"
              value={item.order}
              onChange={(e) => updateItem(idx, { order: Number(e.target.value) })}
              className="col-span-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
            />
            <button type="button" onClick={() => removeItem(idx)} className="col-span-2 text-red-500 text-sm">
              Xóa
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {t('routines_cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          {saving ? 'Đang lưu...' : t('routines_save')}
        </Button>
      </div>
    </form>
  );
}
