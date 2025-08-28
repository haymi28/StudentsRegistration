
import { StudentList } from '@/components/student-list';
import { getServerSession } from '@/lib/auth';
import { getStudents, getUsers } from '@/lib/data';
import { getTranslations } from '@/lib/i18n';
import { redirect } from 'next/navigation';

export default async function StudentsPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/');
  }
  
  const students = await getStudents(session.user.role as any);
  const users = await getUsers();
  const t = await getTranslations();


  const fromServiceDepartment = session.user.role !== 'super_admin' ? session.user.serviceDepartment : undefined;

  const translations = {
      title: t('students.title'),
      descriptionSuperAdmin: t('students.descriptionSuperAdmin'),
      descriptionAdmin: t('students.descriptionAdmin').replace('{department}', fromServiceDepartment || ''),
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
      },
      table: {
          photo: t('students.table.photo'),
          regNumber: t('students.table.regNumber'),
          fullName: t('students.table.fullName'),
          department: t('students.table.department'),
          phone: t('students.table.phone'),
      }
  };

  return (
    <div className="container py-8 flex flex-col items-center">
       <StudentList 
            students={students} 
            users={users} 
            session={session}
            translations={translations}
        />
    </div>
  );
}
