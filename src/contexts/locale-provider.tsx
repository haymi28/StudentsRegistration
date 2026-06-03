'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  createTranslator,
  getDictionary,
  LOCALE_COOKIE_NAME,
  type Locale,
  type TFunction,
  type Translations,
} from '@/lib/translations';

export type { Locale, TFunction, Translations };

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
  isLoaded: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=31536000;samesite=lax`;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>('am');
  const [isLoaded, setIsLoaded] = useState(false);

  const t: TFunction = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return createTranslator(locale)(key, params);
    },
    [locale]
  );

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    const activeLocale: Locale = storedLocale === 'en' || storedLocale === 'am' ? storedLocale : 'am';
    setLocaleState(activeLocale);
    setLocaleCookie(activeLocale);
    document.documentElement.lang = activeLocale;
    setIsLoaded(true);
  }, []);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      localStorage.setItem('locale', newLocale);
      setLocaleCookie(newLocale);
      document.documentElement.lang = newLocale;
      router.refresh();
    },
    [router]
  );

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        {createTranslator('am')('common.loadingLocale')}
      </div>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, isLoaded }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
