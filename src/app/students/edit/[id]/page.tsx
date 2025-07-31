import { getStudentById } from '@/lib/data';
import { StudentRegistrationForm } from '@/components/student-registration-form';
import { EditStudentClient } from '@/components/edit-student-client';

export default async function EditStudentPage({ params }: { params: { id: string }}) {
  const { id } = params;
  const student = await getStudentById(id);

  if (!student) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Student Not Found</h1>
        <p className="text-muted-foreground">The student with the given ID could not be found.</p>
      </div>
    );
  }

  return <EditStudentClient student={student} />;
}
