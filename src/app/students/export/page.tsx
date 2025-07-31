
'use client';

import { getStudents } from '@/lib/data';
import { ExportStudentClient } from '@/components/export-student-client';
import { useEffect, useState } from 'react';
import { Student } from '@prisma/client';

export default function ExportStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const studentData = await getStudents();
      setStudents(studentData);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  if (loading) {
    return <div className="container py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container py-8">
      <ExportStudentClient students={students} />
    </div>
  );
}
