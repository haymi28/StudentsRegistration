
'use client';

import { getServerSession } from '@/lib/auth';
import { useLocale } from '@/contexts/locale-provider';
import { RoleForm } from '@/components/role-form';
import { MainLayout } from '@/components/common/main-layout';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function CreateRolePage() {
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionData = await getServerSession();
      setIsAuthenticated(!!sessionData);
      if (!sessionData || (sessionData.user.role.permissions as Record<string, boolean>)?.manage_roles !== true) {
        redirect('/students');
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
            <RoleForm translations={translations} />
        </div>
        </div>
    </MainLayout>
  );
}
