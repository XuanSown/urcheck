'use client';

import { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { BadgeGrid } from '@/components/BadgeGrid';
import { useLocale } from '@/components/I18nProvider';

type CustomerBadge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string | null;
};

export default function CustomerBadgesPage() {
  const { customer, loading: authLoading } = useCustomerAuth();
  const { locale, t } = useLocale();
  const [badges, setBadges] = useState<CustomerBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      if (!customer) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/customer/badges?locale=${locale}`);
        if (!res.ok) {
          if (!cancelled) setError(t('auth_conn_error'));
          return;
        }
        const data = await res.json();
        if (!cancelled && data.success) setBadges(data.badges);
      } catch {
        if (!cancelled) setError(t('auth_conn_error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, customer, locale, t]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('auth_login_title')}</h1>
          <a href="/customer/login" className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
            {t('auth_login_btn')}
          </a>
        </div>
      </div>
    );
  }

  const earnedCount = badges.filter((b) => b.earnedAt).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('badges_title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('badges_count', undefined, { count: earnedCount, total: badges.length })}
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="text-center text-red-600 dark:text-red-400 py-8">
            {error}
          </div>
        )}

        {!error && loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : !error ? (
          <BadgeGrid badges={badges} t={t} />
        ) : null}
      </div>
    </div>
  );
}
