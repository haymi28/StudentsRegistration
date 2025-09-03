
'use client';

import { getServerSession } from '@/lib/auth';
import { getUsers } from '@/lib/data';
import { UserList } from '@/components/user-list';
import { useLocale } from '@/contexts/locale-provider';
import { MainLayout } from '@/components/common/main-layout';
import { useState, useEffect } from 'react';
import { User, Role } from '@prisma/client';

type UserWithRole = User & { role: Role };

export default function UsersPage() {
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<UserWithRole[]>([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionData = await getServerSession();
      setIsAuthenticated(!!sessionData);
      if (sessionData?.user.role.name === 'Super Admin') {
        const userData = await getUsers();
        setUsers(userData as UserWithRole[]);
      }
    };
    checkAuthAndFetch();
  }, []);

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
    <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8 flex flex-col items-center">
            <UserList users={users} translations={translations} />
        </div>
    </MainLayout>
  );
}
