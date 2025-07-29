'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StudentRegistrationForm } from '@/components/student-registration-form';
import { Skeleton } from '@/components/ui/skeleton';
import { mockStudents, Student } from '@/lib/mock-data';
import { useLocale } from '@/contexts/locale-provider';

export const dynamic = 'force-dynamic';

export default function EditStudentPage() {
  const params = useParams();
  const { id } = params;
  const { t } = useLocale();
  
  const [student, setStudent] = useState<Student | null | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const storedStudents = JSON.parse(localStorage.getItem('students') || 'null') || mockStudents;
      const studentData = storedStudents.find((s: Student) => s.registrationNumber === id);
      setStudent(studentData || null);
    }
  }, [id]);

  if (student === undefined) {
    return (
      <div className="container py-8">
        <div className="space-y-4 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

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
