
import 'server-only';
import { cookies } from 'next/headers';
import {
  createTranslator,
  LOCALE_COOKIE_NAME,
  type Locale,
  type TFunction,
} from '@/lib/translations';

const getLocale = async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE_NAME)?.value;
  return value === 'en' || value === 'am' ? value : 'am';
};

export const getTranslator = async (): Promise<TFunction> => {
  const locale = await getLocale();
  return createTranslator(locale);
};

export { getLocale };
