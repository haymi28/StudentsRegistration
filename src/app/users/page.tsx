
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { getTranslations } from '@/lib/i18n';
import { getUsers } from '@/lib/data';
import { UserList } from '@/components/user-list';

export default async function UsersPage() {
  const session = await getServerSession();
  
  if (!session || session.user.role !== 'super_admin') {
    redirect('/students');
  }

  const users = await getUsers();
  const t = await getTranslations();

  const translations = {
    title: t('users.title'),
    description: t('users.description'),
    searchPlaceholder: t('users.searchPlaceholder'),
    noUsers: t('users.noUsers'),
    createUserButton: t('users.createUserButton'),
    table: {
      displayName: t('users.table.displayName'),
      username: t('users.table.username'),
      role: t('users.table.role'),
      department: t('users.table.department'),
      status: t('users.table.status'),
      actions: t('users.table.actions'),
    },
    deleteDialog: {
      title: t('users.deleteDialog.title'),
      description: t('users.deleteDialog.description'),
      cancel: t('users.deleteDialog.cancel'),
      confirm: t('users.deleteDialog.confirm'),
    },
    deleteSuccess: t('users.deleteSuccess'),
    deleteSuccessDescription: t('users.deleteSuccessDescription'),
    roles: {
      super_admin: t('roles.super_admin'),
      admin: t('roles.admin'),
      teacher: t('roles.teacher'),
    }
  };

  return (
    <div className="container py-8 flex flex-col items-center">
      <UserList users={users} translations={translations} />
    </div>
  );
}
