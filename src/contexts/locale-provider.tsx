
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Locale = 'en' | 'am';
export type Translations = Record<string, any>;
export type TFunction = (key: string, params?: Record<string, string | number>) => string;


interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const getNestedTranslation = (translations: Translations, key: string): string | undefined => {
  return key.split('.').reduce((obj, k) => (obj && typeof obj[k] !== 'undefined') ? obj[k] : undefined, translations);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('am');
  const [translations, setTranslations] = useState<Translations>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    if (storedLocale) {
      setLocaleState(storedLocale);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchTranslations = async () => {
      try {
        const res = await fetch(`/i18n/${locale}.json`);
        if (!res.ok) {
          throw new Error('Failed to load translations');
        }
        const data = await res.json();
        setTranslations(data);
      } catch (error) {
        console.error(error);
        if (locale !== 'en') {
          try {
            const res = await fetch(`/i18n/en.json`);
            const data = await res.json();
            setTranslations(data);
          } catch (e) {
            console.error("Failed to load fallback translations", e)
          }
        }
      }
    };
    fetchTranslations();
  }, [locale, isMounted]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t: TFunction = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = getNestedTranslation(translations, key) || key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  }, [translations]);

  if (!isMounted) {
    return null;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
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
