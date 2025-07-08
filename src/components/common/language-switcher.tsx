'use client';

import { useLocale } from '@/contexts/locale-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-5 w-5 text-muted-foreground" />
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
