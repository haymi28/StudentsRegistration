'use server';

import { getStudents } from '@/lib/data';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ExportStudentClient } from '@/components/export-student-client';


export default async function ExportStudentsPage() {
  const session = await getServerSession();

  if (!session || session.user.role !== 'super_admin') {
    redirect('/students');
  }

  const students = await getStudents('super_admin');
  
  return (
    <div className="container py-8">
      <ExportStudentClient students={students} />
    </div>
  );
}
