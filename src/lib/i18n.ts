import 'server-only';
import { cookies } from 'next/headers';

const dictionaries: Record<string, () => Promise<any>> = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  am: () => import('../dictionaries/am.json').then((module) => module.default),
};

const getNestedTranslation = (translations: any, key: string): string | undefined => {
    return key.split('.').reduce((obj, k) => (obj && typeof obj[k] !== 'undefined') ? obj[k] : undefined, translations);
}

export const getTranslations = async (locale: string) => {
  const dictionary = await dictionaries[locale]();

  return (key: string, params?: Record<string, string | number>): string => {
    let translation = getNestedTranslation(dictionary, key) || key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  }
};
