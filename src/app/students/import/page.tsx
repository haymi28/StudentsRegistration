'use client';

import { BulkImportForm } from '@/components/bulk-import-form';
import { useLocale } from '@/contexts/locale-provider';

export default function ImportPage() {
  const { t } = useLocale();

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">{t('import.pageTitle')}</h1>
          <p className="text-muted-foreground">{t('import.pageDescription')}</p>
        </div>
        <BulkImportForm />
      </div>
    </div>
  );
}
