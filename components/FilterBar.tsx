'use client';

import { useLocale } from '@/components/I18nProvider';

export function FilterBar({
  skinType,
  brand,
  onSkinTypeChange,
  onBrandChange,
  onReset,
}: {
  skinType?: string;
  brand?: string;
  onSkinTypeChange: (v: string | undefined) => void;
  onBrandChange: (v: string | undefined) => void;
  onReset: () => void;
}) {
  const { t } = useLocale();

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={skinType ?? ''}
        onChange={(e) => onSkinTypeChange(e.target.value || undefined)}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
      >
        <option value="">{t('feed_filter_skin') || 'Loại da'}</option>
        <option value="normal">{t('skin_normal') || 'Thường'}</option>
        <option value="oily">{t('skin_oily') || 'Dầu'}</option>
        <option value="dry">{t('skin_dry') || 'Khô'}</option>
        <option value="combination">{t('skin_combination') || 'Hỗn hợp'}</option>
        <option value="sensitive">{t('skin_sensitive') || 'Nhạy cảm'}</option>
      </select>
      <input
        type="text"
        value={brand ?? ''}
        onChange={(e) => onBrandChange(e.target.value || undefined)}
        placeholder={t('feed_filter_brand') || 'Thương hiệu...'}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
      />
      <button
        onClick={onReset}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        {t('feed_filter_reset') || 'Bỏ lọc'}
      </button>
    </div>
  );
}
