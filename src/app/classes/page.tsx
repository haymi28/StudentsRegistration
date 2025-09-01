
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { getClasses } from '@/lib/data';
import { getTranslator } from '@/lib/i18n';
import { ClassList } from '@/components/class-list';

export default async function ClassesPage() {
  const session = await getServerSession();
  
  if (!session || session.user.role.name !== 'Super Admin') {
    redirect('/students');
  }

  const classes = await getClasses();
  const t = await getTranslator();

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
    <div className="container py-8 flex flex-col items-center">
      <ClassList classes={classes} translations={translations} />
    </div>
  );
}
