
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { getUsers } from '@/lib/data';
import { UserList } from '@/components/user-list';
import { getTranslations } from '@/lib/i18n';

export default async function UsersPage() {
  const session = await getServerSession();
  
  if (!session || session.user.role.name !== 'Super Admin') {
    redirect('/students');
  }

  const users = await getUsers();
  const t = await getTranslations();

  const translations = {
    title: t('users.title'),
    description: t('users.description'),
    searchPlaceholder: t('users.searchPlaceholder'),
    createUserButton: t('users.createUserButton'),
    noUsers: t('users.noUsers'),
    table: {
      displayName: t('users.table.displayName'),
      username: t('users.table.username'),
      role: t('users.table.role'),
      status: t('users.table.status'),
      actions: t('users.table.actions'),
    },
    actions: {
        edit: t('students.actions.edit'),
        delete: t('students.actions.delete'),
    },
    deleteDialog: {
      title: t('users.deleteDialog.title'),
      description: t('users.deleteDialog.description'),
      cancel: t('users.deleteDialog.cancel'),
      confirm: t('users.deleteDialog.confirm'),
    },
    deleteSuccess: {
        title: t('users.deleteSuccess.title'),
        description: t('users.deleteSuccess.description')
    },
    roles: {
      super_admin: t('roles.super_admin'),
      admin: t('roles.admin'),
      teacher: t('roles.teacher'),
    },
    status: {
        active: t('users.form.label.active'),
        inactive: t('users.form.label.inactiveShort')
    }
  };

  return (
    <div className="container py-8 flex flex-col items-center">
      <UserList users={users} translations={translations} />
    </div>
  );
}
