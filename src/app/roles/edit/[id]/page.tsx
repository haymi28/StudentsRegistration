
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { getRoleById, getPermissions } from '@/lib/data';
import { getTranslations } from '@/lib/i18n';
import { RoleForm } from '@/components/role-form';

export default async function EditRolePage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (session?.user.role.name !== 'Super Admin') {
    redirect('/students');
  }

  const roleToEdit = await getRoleById(params.id);
  if (!roleToEdit) {
    return (
        <div className="container py-8 text-center">
            <h1 className="text-2xl font-bold">Role Not Found</h1>
            <p className="text-muted-foreground">The role with the given ID could not be found.</p>
        </div>
    );
  }

  const permissions = await getPermissions();
  const { t } = await getTranslations();

  const translations = {
    editTitle: t('roles.form.editTitle'),
    editDescription: t('roles.form.editDescription'),
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
        submit: t('form.save'),
        loading: t('form.loading'),
    },
    success: {
        title: t('roles.form.updateSuccess.title'),
        description: t('roles.form.updateSuccess.description'),
    },
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">{translations.editTitle}</h1>
          <p className="text-muted-foreground">{translations.editDescription}</p>
        </div>
        <RoleForm roleToEdit={roleToEdit} permissions={permissions} translations={translations} />
      </div>
    </div>
  );
}
