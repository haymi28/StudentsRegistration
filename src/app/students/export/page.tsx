
'use client';

import { getStudents } from '@/lib/data';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ExportStudentClient } from '@/components/export-student-client';
import { useEffect, useState } from 'react';
import { Student, Role } from '@prisma/client';
import { MainLayout } from '@/components/common/main-layout';


export default function ExportStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuthAndFetch = async () => {
        const session = await getServerSession();
        setIsAuthenticated(!!session);
        if (!session || session.user.role.name !== 'Super Admin') {
            redirect('/students');
        } else {
            const studentData = await getStudents(session.user.id, session.user.role as Role & { permissions: { permissionId: string }[]});
            setStudents(studentData);
        }
        setLoading(false);
    }
    checkAuthAndFetch();
  }, []);
  
  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8">
        <ExportStudentClient students={students} />
        </div>
    </MainLayout>
  );
}
