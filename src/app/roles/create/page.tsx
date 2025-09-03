
'use client';

import { getServerSession } from '@/lib/auth';
import { getPermissions } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { RoleForm } from '@/components/role-form';
import { MainLayout } from '@/components/common/main-layout';
import { useState, useEffect } from 'react';
import { Permission } from '@prisma/client';

export default function CreateRolePage() {
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionData = await getServerSession();
      setIsAuthenticated(!!sessionData);
      if (sessionData?.user.role.name === 'Super Admin') {
        const perms = await getPermissions();
        setPermissions(perms);
      }
    };
    checkAuthAndFetch();
  }, []);

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
    <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{translations.createTitle}</h1>
            <p className="text-muted-foreground">{translations.createDescription}</p>
            </div>
            <RoleForm permissions={permissions} translations={translations} />
        </div>
        </div>
    </MainLayout>
  );
}
