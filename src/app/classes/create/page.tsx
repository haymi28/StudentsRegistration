
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { getUsers } from '@/lib/data';
import { getTranslator } from '@/lib/i18n';
import { ClassForm } from '@/components/class-form';
import { MainLayout } from '@/components/common/main-layout';

export default async function CreateClassPage() {
  const session = await getServerSession();
  if (session?.user.role.name !== 'Super Admin') {
    redirect('/students');
  }

  const users = await getUsers(true); // Exclude super_admin from being a manager
  const t = await getTranslator();

  const translations = {
    createTitle: t('classes.form.createTitle'),
    createDescription: t('classes.form.createDescription'),
    labels: {
        name: t('classes.form.label.name'),
        manager: t('classes.form.label.manager'),
    },
    placeholders: {
        name: t('classes.form.placeholder.name'),
        manager: t('classes.form.placeholder.manager'),
    },
    buttons: {
        submit: t('form.submit'),
        loading: t('form.loading'),
    },
    success: {
        title: t('classes.form.createSuccess.title'),
        description: t('classes.form.createSuccess.description'),
    },
  };

  return (
    <MainLayout isAuthenticated={!!session}>
        <div className="container py-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{translations.createTitle}</h1>
            <p className="text-muted-foreground">{translations.createDescription}</p>
            </div>
            <ClassForm users={users} translations={translations} />
        </div>
        </div>
    </MainLayout>
  );
}
