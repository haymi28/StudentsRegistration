
import 'server-only';
import { cookies } from 'next/headers';

type TFunction = (key: string, params?: Record<string, string | number>) => string;

const dictionaries: Record<string, () => Promise<any>> = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  am: () => import('../dictionaries/am.json').then((module) => module.default),
};

const getNestedTranslation = (translations: any, key: string): string | undefined => {
    return key.split('.').reduce((obj, k) => (obj && typeof obj[k] !== 'undefined') ? obj[k] : undefined, translations);
}

const getLocale = async () => {
    const cookieStore = cookies();
    return cookieStore.get('locale')?.value || 'am';
}

export const getTranslations = async () => {
  const locale = await getLocale();
  const validLocale = dictionaries[locale] ? locale : 'am';
  return dictionaries[validLocale]();
};

export const getTranslator = async (): Promise<TFunction> => {
  const dictionary = await getTranslations();

  return (key: string, params?: Record<string, string | number>): string => {
    let translation = getNestedTranslation(dictionary, key) || key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  };
};
