'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LOCALE,
  readLocaleFromClient,
  translate,
  writeLocaleToClient,
  type Locale,
} from '@/lib/i18n';

interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with the default locale so SSR and first client render match.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // After hydration, swap in the user preference from localStorage.
  useEffect(() => {
    const stored = readLocaleFromClient();
    if (stored !== locale) {
      setLocaleState(stored);
    }
    // Run only once on mount; locale changes are handled explicitly below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeLocaleToClient(next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, fallback) => translate(locale, key, fallback),
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback for environments where the provider is missing (e.g. tests).
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => undefined,
      t: (key, fallback) => translate(DEFAULT_LOCALE, key, fallback),
    };
  }
  return ctx;
}
