'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Locale = 'en' | 'am';
type Translations = Record<string, any>;

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const getNestedTranslation = (translations: Translations, key: string): string | undefined => {
  return key.split('.').reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : undefined, translations);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('am');
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    if (storedLocale) {
      setLocaleState(storedLocale);
    }
  }, []);

  useEffect(() => {
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
        // Fallback to English if Amharic fails
        if (locale !== 'en') {
          const res = await fetch(`/i18n/en.json`);
          const data = await res.json();
          setTranslations(data);
        }
      }
    };
    fetchTranslations();
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = getNestedTranslation(translations, key) || key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  }, [translations]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {Object.keys(translations).length > 0 ? children : null}
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
