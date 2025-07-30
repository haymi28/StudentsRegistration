'use client';

import { StudentRegistrationForm } from '@/components/student-registration-form';
import { useLocale } from '@/contexts/locale-provider';
import { Student } from '@prisma/client';

interface EditStudentClientProps {
  student: Student | null;
}

export function EditStudentClient({ student }: EditStudentClientProps) {
  const { t } = useLocale();

  if (!student) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">{t('students.noStudents')}</h1>
        <p className="text-muted-foreground">The student with the given ID could not be found.</p>
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
