
'use client';

import { getServerSession } from '@/lib/auth';
import { getClassById, getUsers } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { ClassForm } from '@/components/class-form';
import { MainLayout } from '@/components/common/main-layout';
import { useState, useEffect } from 'react';
import { Class, User } from '@prisma/client';
import { redirect } from 'next/navigation';


export default function EditClassPage({ params }: { params: { id: string } }) {
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [classToEdit, setClassToEdit] = useState<Class | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionData = await getServerSession();
      setIsAuthenticated(!!sessionData);
      if (!sessionData || sessionData.user.role.name !== 'Super Admin') {
        redirect('/students');
      } else {
        const [classData, userData] = await Promise.all([
          getClassById(params.id),
          getUsers(true)
        ]);
        setClassToEdit(classData);
        setUsers(userData);
      }
    };
    checkAuthAndFetch();
  }, [params.id]);
  
  const translations = {
    editTitle: t('classes.form.editTitle'),
    editDescription: t('classes.form.editDescription'),
    labels: {
        name: t('classes.form.label.name'),
        manager: t('classes.form.label.manager'),
    },
    placeholders: {
        name: t('classes.form.placeholder.name'),
        manager: t('classes.form.placeholder.manager'),
    },
    buttons: {
        submit: t('form.save'),
        loading: t('form.loading'),
    },
    success: {
        title: t('classes.form.updateSuccess.title'),
        description: t('classes.form.updateSuccess.description'),
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
            {classToEdit && <ClassForm classToEdit={classToEdit} users={users} translations={translations} />}
        </div>
        </div>
    </MainLayout>
  );
}
