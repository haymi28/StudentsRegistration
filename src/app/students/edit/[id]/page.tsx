'use server';

import { getStudentById } from '@/lib/data';
import { EditStudentClient } from '@/components/edit-student-client';

export default async function EditStudentPage({ params }: { params: { id: string }}) {
  const { id } = params;
  const student = await getStudentById(id);

  return <EditStudentClient student={student} />;
}
