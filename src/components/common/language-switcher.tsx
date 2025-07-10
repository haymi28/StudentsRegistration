'use client';

import { useLocale } from '@/contexts/locale-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="flex items-center">
      <Select value={locale} onValueChange={(value) => setLocale(value as 'en' | 'am')}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder={t('nav.language')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="am">አማርኛ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
