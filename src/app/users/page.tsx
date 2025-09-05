
import { getServerSession } from '@/lib/auth';
import { getUsers } from '@/lib/data';
import { getTranslator } from '@/lib/i18n';
import { UserList } from '@/components/user-list';
import { MainLayout } from '@/components/common/main-layout';
import { User, Role } from '@prisma/client';
import { redirect } from 'next/navigation';

type UserWithRole = User & { role: Role };

export default async function UsersPage() {
  const t = await getTranslator();
  const session = await getServerSession();

  if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_users !== true) {
    redirect('/students');
  }
  
  const users = (await getUsers()) as UserWithRole[];

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
      cancel: t('students.deleteDialog.cancel'),
      confirm: t('students.deleteDialog.confirm'),
    },
    deleteSuccess: {
        title: t('users.deleteSuccess.title'),
        description: t('users.deleteSuccess.description')
    },
    status: {
        active: t('users.form.label.active'),
        inactive: t('users.form.label.inactiveShort')
    },
  };

  return (
    <MainLayout>
        <div className="container py-8 flex flex-col items-center">
            <UserList users={users} translations={translations} />
        </div>
    </MainLayout>
  );
}
