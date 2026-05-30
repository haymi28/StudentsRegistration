import { ImportPhotosForm } from '@/components/import-photos-form';
import { getTranslator } from '@/lib/i18n';
import { requirePermission } from '@/lib/auth';
import { MainLayout } from '@/components/common/main-layout';

export default async function ImportPhotosPage() {
  await requirePermission('import_students_photos');
  const t = await getTranslator();

  return (
    <MainLayout isAuthenticated={true}>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{t('importPhotos.pageTitle')}</h1>
            <p className="text-muted-foreground">{t('importPhotos.pageDescription')}</p>
          </div>
          <ImportPhotosForm />
        </div>
      </div>
    </MainLayout>
  );
}
