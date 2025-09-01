
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { getPermissions } from '@/lib/data';
import { getTranslations } from '@/lib/i18n';
import { RoleForm } from '@/components/role-form';

export default async function CreateRolePage() {
  const session = await getServerSession();
  if (session?.user.role.name !== 'Super Admin') {
    redirect('/students');
  }

  const permissions = await getPermissions();
  const { t } = await getTranslations();

  const translations = {
    createTitle: t('roles.form.createTitle'),
    createDescription: t('roles.form.createDescription'),
    labels: {
        name: t('roles.form.label.name'),
        description: t('roles.form.label.description'),
        permissions: t('roles.form.label.permissions'),
    },
    placeholders: {
        name: t('roles.form.placeholder.name'),
        description: t('roles.form.placeholder.description'),
    },
    buttons: {
        submit: t('form.submit'),
        loading: t('form.loading'),
    },
    success: {
        title: t('roles.form.createSuccess.title'),
        description: t('roles.form.createSuccess.description'),
    },
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">{translations.createTitle}</h1>
          <p className="text-muted-foreground">{translations.createDescription}</p>
        </div>
        <RoleForm permissions={permissions} translations={translations} />
      </div>
    </div>
  );
}
