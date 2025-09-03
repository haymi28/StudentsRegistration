
'use client';

import { getServerSession } from '@/lib/auth';
import { getRoleById, getPermissions } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { RoleForm } from '@/components/role-form';
import { MainLayout } from '@/components/common/main-layout';
import { useState, useEffect } from 'react';
import { Role, Permission } from '@prisma/client';
import { redirect } from 'next/navigation';

type RoleWithPermissions = Role & { permissions: { permissionId: string }[] };

export default function EditRolePage({ params }: { params: { id: string } }) {
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<RoleWithPermissions | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionData = await getServerSession();
      setIsAuthenticated(!!sessionData);
      if (!sessionData || sessionData.user.role.name !== 'Super Admin') {
        redirect('/students');
      } else {
        const [roleData, permsData] = await Promise.all([
          getRoleById(params.id),
          getPermissions()
        ]);
        setRoleToEdit(roleData as RoleWithPermissions);
        setPermissions(permsData);
      }
    };
    checkAuthAndFetch();
  }, [params.id]);

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
    <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{translations.editTitle}</h1>
            <p className="text-muted-foreground">{translations.editDescription}</p>
            </div>
            {roleToEdit && <RoleForm roleToEdit={roleToEdit} permissions={permissions} translations={translations} />}
        </div>
        </div>
    </MainLayout>
  );
}
