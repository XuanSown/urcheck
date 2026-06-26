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

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  /** Resolved theme currently applied to <html> ('light' | 'dark'). */
  resolved: 'light' | 'dark';
  setTheme: (next: Theme) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'urcheck.theme';
const COOKIE_KEY = 'urcheck_theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Read theme preference from localStorage.
 * Falls back to 'system' when the value is missing or invalid.
 * SSR-safe (returns null on server).
 */
function readThemeFromClient(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    /* ignore */
  }
  return null;
}

function writeThemeToClient(theme: Theme): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
    // Mirror to cookie so server components could read it later if needed.
    document.cookie = `${COOKIE_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

/**
 * Compute the theme that should be applied to the <html> element.
 * For 'light'/'dark' returns the value as-is. For 'system' checks the OS.
 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(resolved: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always start with 'system' so SSR + first client render match.
  // The actual class is set after hydration in the effect below.
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  // After hydration, swap in the user preference from localStorage
  // and apply it to <html>.
  useEffect(() => {
    const stored = readThemeFromClient();
    if (stored) {
      setThemeState(stored);
    }
    // Run only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply theme to DOM whenever theme changes.
  useEffect(() => {
    const next = resolveTheme(theme);
    applyTheme(next);
    setResolved(next);
    writeThemeToClient(theme);

    // For 'system', also listen to OS-level changes.
    if (theme === 'system' && typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = () => {
        const next2 = resolveTheme('system');
        applyTheme(next2);
        setResolved(next2);
      };
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState(prev => {
      // light → dark → system → light
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolved, setTheme, toggle }),
    [theme, resolved, setTheme, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for environments where the provider is missing (tests).
    return {
      theme: 'system',
      resolved: 'light',
      setTheme: () => undefined,
      toggle: () => undefined,
    };
  }
  return ctx;
}

/**
 * Inline script injected into <head> to apply the theme class before
 * the page renders. Prevents "flash of wrong theme" on first load.
 */
export function ThemeScript() {
  const code = `
    (function() {
      try {
        var raw = localStorage.getItem('urcheck.theme');
        var t = (raw === 'light' || raw === 'dark' || raw === 'system') ? raw : 'system';
        var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (dark) document.documentElement.classList.add('dark');
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}