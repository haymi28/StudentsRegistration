'use server';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStudents, getUsers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentActions } from './student-actions';
import { getServerSession } from '@/lib/auth';
import { getTranslations } from '@/lib/i18n';

export async function StudentList() {
  const session = await getServerSession();
  
  if (!session) {
    return null;
  }
  
  const students = await getStudents(session.user.role as any);
  const users = await getUsers();
  const t = await getTranslations();


  const fromServiceDepartment = session.user.role !== 'super_admin' ? session.user.serviceDepartment : undefined;

  const translations = {
      title: t('students.title'),
      descriptionSuperAdmin: t('students.descriptionSuperAdmin'),
      descriptionAdmin: t('students.descriptionAdmin'),
      table: {
          photo: t('students.table.photo'),
          regNumber: t('students.table.regNumber'),
          fullName: t('students.table.fullName'),
          department: t('students.table.department'),
          phone: t('students.table.phone'),
          actions: t('students.table.actions'),
      },
      searchPlaceholder: t('students.searchPlaceholder'),
      noStudents: t('students.noStudents'),
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-grow">
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>
            {session.user.role === 'super_admin'
              ? translations.descriptionSuperAdmin
              : translations.descriptionAdmin.replace('{department}', fromServiceDepartment || '')}
          </CardDescription>
        </div>
        <StudentActions students={students} users={users} session={session} translations={{
          searchPlaceholder: t('students.searchPlaceholder'),
          transferButton: t('students.transferButton'),
          row: {
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
        }} />
      </CardHeader>
      <CardContent>
        {/* This component is now handled inside StudentActions */}
      </CardContent>
    </Card>
  );
}
