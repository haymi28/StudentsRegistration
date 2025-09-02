
'use client';

import { StudentRegistrationForm } from '@/components/student-registration-form';
import { Student, Class } from '@prisma/client';
import { TFunction } from '@/contexts/locale-provider';

interface EditStudentClientProps {
  student: Student;
  classes: Class[];
  session: any;
  t: TFunction;
}

export function EditStudentClient({ student, classes, session, t }: EditStudentClientProps) {

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">{t('register.editPageTitle')}</h1>
          <p className="text-muted-foreground">{t('register.editPageDescription')}</p>
        </div>
        <StudentRegistrationForm 
          studentToEdit={student} 
          classes={classes} 
          session={session} 
          t={t}
        />
      </div>
    </div>
  );
}
