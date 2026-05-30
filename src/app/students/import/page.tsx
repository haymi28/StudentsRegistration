import { BulkImportForm } from '@/components/bulk-import-form';
import { getTranslator } from '@/lib/i18n';
import { requirePermission } from '@/lib/auth';
import { MainLayout } from '@/components/common/main-layout';

export default async function ImportPage() {
  await requirePermission('import_students_text');
  const t = await getTranslator();

  return (
    <MainLayout isAuthenticated={true}>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{t('import.pageTitle')}</h1>
            <p className="text-muted-foreground">{t('import.pageDescription')}</p>
          </div>
          <BulkImportForm />
        </div>
      </div>
    </MainLayout>
  );
}
