'use client';

import { getStudents } from '@/lib/data';
import { ExportStudentClient } from '@/components/export-student-client';
import { useEffect, useState } from 'react';
import { Student } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/constants';

export default function ExportStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const role = localStorage.getItem('user_role') as UserRole | null;
      if (role !== 'super_admin') {
        router.replace('/students');
      } else {
        const studentData = await getStudents('super_admin');
        setStudents(studentData);
        setLoading(false);
      }
    };
    checkAuthAndFetch();
  }, [router]);

  if (loading) {
    return <div className="container py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container py-8">
      <ExportStudentClient students={students} />
    </div>
  );
}
