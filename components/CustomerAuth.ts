'use client';

import { useEffect, useState, useCallback } from 'react';

export function useCustomerAuth() {
  const [customer, setCustomer] = useState<{ email?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/customer/verify', {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/customer/logout', {
      method: 'POST',
      headers: { 'x-requested-with': 'XMLHttpRequest' },
    });
    setCustomer(null);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return { customer, loading, logout, refresh: checkSession };
}
