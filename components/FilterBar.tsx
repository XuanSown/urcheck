'use client';

import { motion, useReducedMotion } from 'framer-motion';
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
  const reduced = useReducedMotion();
  const hasFilter = Boolean(skinType || brand);

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.25 }}
      className="sticky top-0 z-10 -mx-4 px-4 py-3 mb-6 backdrop-blur bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800"
    >
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="filter-skin-type" className="sr-only">
          {t('feed_filter_skin') || 'Lọc theo loại da'}
        </label>
        <select
          id="filter-skin-type"
          value={skinType ?? ''}
          onChange={(e) => onSkinTypeChange(e.target.value || undefined)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">{t('feed_filter_skin') || 'Loại da'}</option>
          <option value="normal">{t('skin_normal') || 'Thường'}</option>
          <option value="oily">{t('skin_oily') || 'Dầu'}</option>
          <option value="dry">{t('skin_dry') || 'Khô'}</option>
          <option value="combination">{t('skin_combination') || 'Hỗn hợp'}</option>
          <option value="sensitive">{t('skin_sensitive') || 'Nhạy cảm'}</option>
        </select>
        <label htmlFor="filter-brand" className="sr-only">
          {t('feed_filter_brand') || 'Tìm kiếm theo thương hiệu'}
        </label>
        <input
          id="filter-brand"
          type="text"
          value={brand ?? ''}
          onChange={(e) => onBrandChange(e.target.value || undefined)}
          placeholder={t('feed_filter_brand') || 'Thương hiệu...'}
          aria-label={t('feed_filter_brand') || 'Tìm kiếm theo thương hiệu'}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        {skinType && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">
            {skinType}
            <button onClick={() => onSkinTypeChange(undefined)} aria-label="Xoá lọc loại da" className="ml-0.5 text-primary-500 hover:text-primary-700">✕</button>
          </span>
        )}
        {brand && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">
            {brand}
            <button onClick={() => onBrandChange(undefined)} aria-label="Xoá lọc thương hiệu" className="ml-0.5 text-primary-500 hover:text-primary-700">✕</button>
          </span>
        )}

        {hasFilter && (
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('filter_clear')}
          </button>
        )}
      </div>
    </motion.div>
  );
}
