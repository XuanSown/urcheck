'use client';

import { useLocale } from '@/components/I18nProvider';
import { LOCALES, type Locale } from '@/lib/i18n';

/**
 * Compact language switcher (VI / EN).
 * Render inside the footer (or any low-priority area).
 * Selection persists via I18nProvider (localStorage + cookie).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={
        'inline-flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-full p-1 ' +
        (className ?? '')
      }
      role="group"
      aria-label="Language switcher"
    >
      {LOCALES.map((loc: Locale) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          className={
            'px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ' +
            (locale === loc
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800')
          }
          aria-pressed={locale === loc}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
