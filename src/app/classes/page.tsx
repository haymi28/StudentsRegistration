
import { getServerSession } from '@/lib/auth';
import { getClasses } from '@/lib/data';
import { getTranslator } from '@/lib/i18n';
import { ClassList } from '@/components/class-list';
import { MainLayout } from '@/components/common/main-layout';
import { Class, User } from '@prisma/client';
import { redirect } from 'next/navigation';

type ClassWithDetails = Class & { manager: User | null; _count: { students: number } };

export default async function ClassesPage() {
  const t = await getTranslator();
  const session = await getServerSession();

  if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_classes !== true) {
    redirect('/students');
  }

  const classes = (await getClasses()) as ClassWithDetails[];

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
    <MainLayout>
        <div className="container py-8 flex flex-col items-center">
            <ClassList classes={classes} translations={translations} />
        </div>
    </MainLayout>
  );
}
