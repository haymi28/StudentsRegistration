
'use client';

import { StudentList } from '@/components/student-list';
import { getServerSession } from '@/lib/auth';
import { getStudents, getUsers } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { MainLayout } from '@/components/common/main-layout';
import { useEffect, useState } from 'react';
import { Student, User, Class, Role } from '@prisma/client';
import { redirect } from 'next/navigation';

type StudentWithClass = Student & { class: Class | null };

export default function StudentsPage() {
  const { t } = useLocale();
  const [session, setSession] = useState<any>(null);
  const [students, setStudents] = useState<StudentWithClass[]>([]);
  const [users, setUsers] = useState<Partial<User>[]>([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionData = await getServerSession();
      if (!sessionData) {
        redirect('/');
        return;
      }
      setSession(sessionData);

      const [studentData, userData] = await Promise.all([
        getStudents(sessionData.user.id, sessionData.user.role as Role),
        getUsers()
      ]);
      setStudents(studentData as StudentWithClass[]);
      setUsers(userData);
    };
    checkAuthAndFetch();
  }, []);
  
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
        {session && (
             <StudentList 
                students={students} 
                users={users} 
                session={session}
                translations={translations}
            />
        )}
        </div>
    </MainLayout>
  );
}
