'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { useLocale } from '@/components/I18nProvider';
import { Button } from '@/components/ui/Button';
import { TIME_ORDER, groupItemsByTimeOfDay } from '@/lib/routine-utils';

export default function SharedRoutinePage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { customer, loading: authLoading } = useCustomerAuth();
  const { t, locale } = useLocale();
  const router = useRouter();
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    params.then((p) => setShareToken(p.shareToken));
  }, [params]);

  useEffect(() => {
    if (!shareToken) return;
    (async () => {
      try {
        const res = await fetch(`/api/routines/${shareToken}`, { headers: { 'Accept-Language': locale } });
        const data = await res.json();
        if (data.success) setRoutine(data.routine);
        else setNotFound(true);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [shareToken, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !routine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <p className="text-gray-700 dark:text-gray-300">{t('routines_not_found')}</p>
      </div>
    );
  }

  const groups = groupItemsByTimeOfDay(routine.items || []);

  const handleClone = async () => {
    if (!customer) {
      router.push(`/customer/login?next=/routines/${shareToken}`);
      return;
    }
    setCloning(true);
    try {
      const res = await fetch('/api/customer/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept-Language': locale },
        body: JSON.stringify({
          title: routine.title,
          description: routine.description,
          isPublic: false,
          items: (routine.items || []).map((it: any) => ({
            productId: it.productId,
            productName: it.productName,
            brandName: it.brandName,
            imageUrl: it.imageUrl,
            timeOfDay: it.timeOfDay,
            order: it.order,
            notes: it.notes,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(t('routines_cloned'));
        router.push('/customer/routines');
      } else {
        alert(t('routines_clone_failed') || 'Không thể lưu routine. Vui lòng thử lại.');
      }
    } catch {
      // silent
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{routine.title}</h1>
            {routine.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{routine.description}</p>}
          </div>
          <Button variant="primary" size="sm" onClick={handleClone} loading={cloning}>
            {t('routines_clone')}
          </Button>
        </div>

        {TIME_ORDER.map((time) => {
          const items = groups[time];
          if (!items.length) return null;
          return (
            <div key={time} className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t(`routines_${time}` as any)}</h2>
              <div className="space-y-2">
                {items.map((it: any, idx: number) => (
                  <div key={it.id ?? idx} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                    {it.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{it.productName}</p>
                      {it.brandName && <p className="text-xs text-gray-500 truncate">{it.brandName}</p>}
                      {it.notes && <p className="text-xs text-gray-500 mt-1">{it.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
