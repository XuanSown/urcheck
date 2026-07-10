'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/components/CustomerAuth';
import { RoutineForm } from '@/components/RoutineForm';
import { RoutineList } from '@/components/RoutineList';
import { useLocale } from '@/components/I18nProvider';

function CustomerRoutinesContent() {
  const { customer, loading: authLoading } = useCustomerAuth();
  const { locale, t } = useLocale();
  const searchParams = useSearchParams();
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && routines.length && !showForm) {
      const r = routines.find((x: any) => x.id === editId);
      if (r) {
        setEditing(r);
        setShowForm(true);
      }
    }
  }, [searchParams, routines, showForm]);

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customer/routines', {
        headers: { 'Accept-Language': locale },
      });
      const data = await res.json();
      if (data.success) setRoutines(data.routines);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && customer) fetchRoutines();
    else if (!authLoading && !customer) setLoading(false);
  }, [authLoading, customer, locale]);

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vui lòng đăng nhập</h1>
          <a href="/customer/login" className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lịch trình Skincare của tôi</h1>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('routines_create_btn')}
          </button>
        </div>

        {showForm && (
          <RoutineForm
            routine={editing}
            onClose={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSaved={() => {
              setShowForm(false);
              setEditing(null);
              fetchRoutines();
            }}
          />
        )}

        {loading && !showForm ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <RoutineList
            routines={routines}
            onChanged={fetchRoutines}
            onEdit={(r) => {
              setEditing(r);
              setShowForm(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function CustomerRoutinesPage() {
  return (
    <Suspense fallback={null}>
      <CustomerRoutinesContent />
    </Suspense>
  );
}
