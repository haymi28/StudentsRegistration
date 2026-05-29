'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en from '@/dictionaries/en.json';
import am from '@/dictionaries/am.json';

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

const getNestedTranslation = (translations: Translations, key: string): any => {
  return key.split('.').reduce((obj, k) => (obj && typeof obj[k] !== 'undefined') ? obj[k] : undefined, translations);
}

const dictionaries: Record<Locale, Translations> = { en, am };

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('am');
  const [translations, setTranslations] = useState<Translations>(dictionaries['am']);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    const activeLocale = storedLocale ?? 'am';
    setLocaleState(activeLocale);
    setTranslations(dictionaries[activeLocale]);
    setIsLoaded(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setTranslations(dictionaries[newLocale]);
    localStorage.setItem('locale', newLocale);
  };

  const t: TFunction = useCallback((key: string, params?: Record<string, string | number>): string => {
    const result = getNestedTranslation(translations, key);
    let translation = typeof result === 'string' ? result : key;
    
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  }, [translations]);

  if (!isLoaded) {
    return <div>Loading...</div>;
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
