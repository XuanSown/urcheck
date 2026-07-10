'use client';

import { useLocale } from '@/components/I18nProvider';
import { Button } from '@/components/ui/Button';

type RoutineItemInput = {
  productId?: string;
  productName?: string;
  brandName?: string;
  imageUrl?: string;
  timeOfDay?: string;
  order?: number;
  notes?: string;
};

export function RoutineList({
  routines,
  onChanged,
  onEdit,
}: {
  routines: any[];
  onChanged: () => void;
  onEdit?: (routine: any) => void;
}) {
  const { t } = useLocale();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`${t('routines_confirm_delete')} "${title}"?`)) return;
    const res = await fetch(`/api/customer/routines/${id}`, { method: 'DELETE' });
    if (res.ok) onChanged();
  };

  if (!routines.length) {
    return <p className="text-center text-gray-500 py-8">{t('routines_empty')}</p>;
  }

  return (
    <div className="space-y-4">
      {routines.map((r) => (
        <div key={r.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-start justify-between mb-3">
              <div>
                <a href={`/customer/routines/${r.id}`} className="hover:underline">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{r.title}</h3>
                </a>
                {r.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.description}</p>}
              <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {r.isPublic ? t('routines_public_label') : t('routines_private_label')}
              </span>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(r)} aria-label={t('routines_edit_title')}>
                  {t('routines_edit_title')}
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={() => handleDelete(r.id, r.title)} aria-label={t('routines_delete')}>
                {t('routines_delete')}
              </Button>
            </div>
          </div>

          {(!r.items || r.items.length === 0) ? (
            <p className="text-sm text-gray-500">{t('routines_no_products')}</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {r.items.map((it: any, idx: number) => (
                <div key={it.id ?? idx} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{it.productName}</p>
                    {it.timeOfDay && (
                      <p className="text-xs text-gray-500">{t(`routines_${it.timeOfDay}` as any)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
