
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { getRoles } from '@/lib/data';
import { getTranslations } from '@/lib/i18n';
import { RoleList } from '@/components/role-list';

export default async function RolesPage() {
  const session = await getServerSession();
  
  if (!session || session.user.role.name !== 'Super Admin') {
    redirect('/students');
  }

  const roles = await getRoles();
  const { t } = await getTranslations();

  const translations = {
    title: t('roles.title'),
    description: t('roles.description'),
    createButton: t('roles.createButton'),
    noRoles: t('roles.noRoles'),
    table: {
      name: t('roles.table.name'),
      description: t('roles.table.description'),
      usersCount: t('roles.table.usersCount'),
      actions: t('roles.table.actions'),
    },
    actions: {
        edit: t('students.actions.edit'),
        delete: t('students.actions.delete'),
    },
    deleteDialog: {
      title: t('roles.deleteDialog.title'),
      description: t('roles.deleteDialog.description'),
      descriptionWithUsers: t('roles.deleteDialog.descriptionWithUsers'),
      cancel: t('students.deleteDialog.cancel'),
      confirm: t('students.deleteDialog.confirm'),
    },
    deleteSuccess: {
        title: t('roles.deleteSuccess.title'),
        description: t('roles.deleteSuccess.description')
    },
  };

  return (
    <div className="container py-8 flex flex-col items-center">
      <RoleList roles={roles} translations={translations} />
    </div>
  );
}
