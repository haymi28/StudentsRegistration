
'use server';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getStudents, getUsers } from '@/lib/data';
import { StudentActions } from './student-actions';
import { getTranslations } from '@/lib/i18n';
import { cookies } from 'next/headers';

export async function StudentList() {
  const locale = cookies().get('locale')?.value || 'am';
  const t = await getTranslations(locale);

  const students = await getStudents('super_admin');
  const users = await getUsers();

  const translations = {
      title: t('students.title'),
      descriptionSuperAdmin: t('students.descriptionSuperAdmin'),
      searchPlaceholder: t('students.searchPlaceholder'),
      noStudents: t('students.noStudents'),
      rowActions: {
        actions: t('students.table.actions'),
        view: t('students.actions.view'),
        edit: t('students.actions.edit'),
        delete: t('students.actions.delete'),
        deleteSuccess: t('students.deleteSuccess'),
        deleteSuccessDescription: t('students.deleteSuccessDescription'),
        deleteDialog: {
          title: t('students.deleteDialog.title'),
          description: t('students.deleteDialog.description'),
          cancel: t('students.deleteDialog.cancel'),
          confirm: t('students.deleteDialog.confirm'),
        }
      }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-grow">
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>
            {translations.descriptionSuperAdmin}
          </CardDescription>
        </div>
        <StudentActions 
            students={students} 
            users={users} 
            translations={{
              searchPlaceholder: translations.searchPlaceholder,
              row: translations.rowActions
            }}
        />
      </CardHeader>
      <CardContent>
        {/* The table and card views are now inside StudentActions */}
      </CardContent>
    </Card>
  );
}
