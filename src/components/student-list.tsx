
'use server';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getStudents, getUsers } from '@/lib/data';
import { StudentActions } from './student-actions';
import { getServerSession } from '@/lib/auth';
import { getTranslations } from '@/lib/i18n';
import { UserRole } from '@/lib/constants';
import { roleToServiceDepartmentMap } from '@/lib/constants';
import { cookies } from 'next/headers';

export async function StudentList() {
  const session = await getServerSession();
  
  if (!session?.user?.role) {
      // This should be caught by middleware, but as a safeguard.
      return <p>Access Denied.</p>
  }
  
  const locale = cookies().get('locale')?.value || 'am';
  const t = await getTranslations(locale);

  const students = await getStudents(session.user.role);
  const users = await getUsers();

  const fromServiceDepartment = session.user.role !== 'super_admin' ? roleToServiceDepartmentMap[session.user.role as Exclude<UserRole, 'super_admin'>] : undefined;

  const translations = {
      title: t('students.title'),
      descriptionSuperAdmin: t('students.descriptionSuperAdmin'),
      descriptionAdmin: t('students.descriptionAdmin'),
      searchPlaceholder: t('students.searchPlaceholder'),
      noStudents: t('students.noStudents'),
      transferButton: t('students.transferButton'),
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
            {session.user.role === 'super_admin'
              ? translations.descriptionSuperAdmin
              : translations.descriptionAdmin.replace('{department}', fromServiceDepartment || '')}
          </CardDescription>
        </div>
        <StudentActions 
            students={students} 
            users={users} 
            session={session}
            translations={{
              searchPlaceholder: translations.searchPlaceholder,
              transferButton: translations.transferButton,
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
