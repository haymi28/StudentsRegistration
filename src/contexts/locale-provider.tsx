
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Locale = 'en' | 'am';
export type Translations = Record<string, any>;
export type TFunction = (key: string, params?: Record<string, string | number>) => string;


interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
  isLoaded: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const getNestedTranslation = (translations: Translations, key: string): string | undefined => {
  return key.split('.').reduce((obj, k) => (obj && typeof obj[k] !== 'undefined') ? obj[k] : undefined, translations);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('am');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    if (storedLocale) {
      setLocaleState(storedLocale);
    } else {
        localStorage.setItem('locale', 'am');
    }
  }, []);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const res = await fetch(`/i18n/${locale}.json`);
        if (!res.ok) {
          throw new Error(`Failed to load ${locale} translations`);
        }
        const data = await res.json();
        setTranslations(data);
      } catch (error) {
        console.error(error);
        // Fallback to English if the desired locale fails
        if (locale !== 'en') {
          try {
            const res = await fetch(`/i18n/en.json`);
            const data = await res.json();
            setTranslations(data);
          } catch (e) {
            console.error("Failed to load fallback translations", e)
          }
        }
      } finally {
        setIsLoaded(true);
      }
    };
    fetchTranslations();
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setIsLoaded(false);
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

  if (!isLoaded) {
    return null; // Or a global loading spinner
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
