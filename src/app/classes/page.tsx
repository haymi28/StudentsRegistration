
'use client';

import { getServerSession } from '@/lib/auth';
import { getClasses } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { ClassList } from '@/components/class-list';
import { MainLayout } from '@/components/common/main-layout';
import { useState, useEffect } from 'react';
import { Class, User } from '@prisma/client';

type ClassWithDetails = Class & { manager: User | null; _count: { students: number } };

export default function ClassesPage() {
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionData = await getServerSession();
      setIsAuthenticated(!!sessionData);
      if (sessionData?.user.role.name === 'Super Admin') {
        const classData = await getClasses();
        setClasses(classData as ClassWithDetails[]);
      }
    };
    checkAuthAndFetch();
  }, []);

  const translations = {
    title: t('classes.title'),
    description: t('classes.description'),
    createButton: t('classes.createButton'),
    noClasses: t('classes.noClasses'),
    table: {
      name: t('classes.table.name'),
      manager: t('classes.table.manager'),
      studentCount: t('classes.table.studentCount'),
      actions: t('classes.table.actions'),
    },
    actions: {
        edit: t('students.actions.edit'),
        delete: t('students.actions.delete'),
    },
    deleteDialog: {
      title: t('classes.deleteDialog.title'),
      description: t('classes.deleteDialog.description'),
      descriptionWithStudents: t('classes.deleteDialog.descriptionWithStudents'),
      cancel: t('students.deleteDialog.cancel'),
      confirm: t('students.deleteDialog.confirm'),
    },
    deleteSuccess: {
        title: t('classes.deleteSuccess.title'),
        description: t('classes.deleteSuccess.description')
    },
  };

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8 flex flex-col items-center">
            <ClassList classes={classes} translations={translations} />
        </div>
    </MainLayout>
  );
}
