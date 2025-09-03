
'use client';

import { getServerSession } from '@/lib/auth';
import { getRoles } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { RoleList } from '@/components/role-list';
import { MainLayout } from '@/components/common/main-layout';
import { useState, useEffect } from 'react';
import { Role } from '@prisma/client';

type RoleWithDetails = Role & { _count: { users: number } };

export default function RolesPage() {
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roles, setRoles] = useState<RoleWithDetails[]>([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionData = await getServerSession();
      setIsAuthenticated(!!sessionData);
      if (sessionData?.user.role.name === 'Super Admin') {
        const roleData = await getRoles();
        setRoles(roleData as RoleWithDetails[]);
      }
    };
    checkAuthAndFetch();
  }, []);

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
    <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8 flex flex-col items-center">
            <RoleList roles={roles} translations={translations} />
        </div>
    </MainLayout>
  );
}
