
import { StudentList } from '@/components/student-list';
import { getServerSession } from '@/lib/auth';
import { getStudents, getUsers } from '@/lib/data';
import { getTranslator } from '@/lib/i18n';
import { MainLayout } from '@/components/common/main-layout';
import { Student, User, Class, Role } from '@prisma/client';
import { redirect } from 'next/navigation';

type StudentWithClass = Student & { class: Class | null };

export default async function StudentsPage() {
  const t = await getTranslator();
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  const [students, users] = await Promise.all([
    getStudents(session.user.id, session.user.role as Role),
    getUsers()
  ]);

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
    <MainLayout>
        <div className="container py-8 flex flex-col items-center">
             <StudentList 
                students={students as StudentWithClass[]} 
                users={users} 
                session={session}
                translations={translations}
            />
        </div>
    </MainLayout>
  );
}
