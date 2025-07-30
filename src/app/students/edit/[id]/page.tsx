'use server';

import { StudentRegistrationForm } from '@/components/student-registration-form';
import { useLocale } from '@/contexts/locale-provider';
import { getStudentById } from '@/lib/data';

export default async function EditStudentPage({ params }: { params: { id: string }}) {
  const { id } = params;
  const { t } = useLocale();
  
  const student = await getStudentById(id);

  if (!student) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">{t('students.noStudents')}</h1>
        <p className="text-muted-foreground">The student with registration number {id} could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">{t('register.editPageTitle')}</h1>
          <p className="text-muted-foreground">{t('register.editPageDescription')}</p>
        </div>
        <StudentRegistrationForm studentToEdit={student} />
      </div>
    </div>
  );
}
