'use client';

import { getStudents } from '@/lib/data';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ExportStudentClient } from '@/components/export-student-client';
import { useEffect, useState } from 'react';
import { Student } from '@prisma/client';


export default function ExportStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    const checkAuthAndFetch = async () => {
        const session = await getServerSession();
        if (!session || session.user.role !== 'super_admin') {
            redirect('/students');
        } else {
            const studentData = await getStudents('super_admin');
            setStudents(studentData);
        }
    }
    checkAuthAndFetch();
  }, []);
  
  return (
    <div className="container py-8">
      <ExportStudentClient students={students} />
    </div>
  );
}
