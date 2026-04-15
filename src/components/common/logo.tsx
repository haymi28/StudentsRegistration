
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLocale } from '@/contexts/locale-provider';

export function Logo({ className }: { className?: string }) {
  const { t } = useLocale();

  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} aria-label="Back to homepage">
      <span className="hidden sm:inline-block text-xl font-bold text-primary-foreground tracking-tight group-data-[state=collapsed]:hidden">
        {t('nav.systemName')}
      </span>
    </Link>
  );
}
