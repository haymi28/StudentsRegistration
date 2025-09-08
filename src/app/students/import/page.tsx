
import { BulkImportForm } from '@/components/bulk-import-form';
import { getTranslator } from '@/lib/i18n';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/common/main-layout';

export default async function ImportPage() {
  const session = await getServerSession();
  if (!session) {
    redirect('/');
  }

  const permissions = session.user.role.permissions as Record<string, boolean>;
  if (!permissions?.import_students) {
    redirect('/students');
  }

  const t = await getTranslator();

  return (
    <MainLayout isAuthenticated={!!session}>
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
