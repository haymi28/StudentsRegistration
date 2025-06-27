'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StudentRegistrationForm } from '@/components/student-registration-form';
import { Skeleton } from '@/components/ui/skeleton';
import { mockStudents, Student } from '@/lib/mock-data';

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [student, setStudent] = useState<Student | null | undefined>(undefined);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    if (id) {
      const studentData = mockStudents.find(s => s.registrationNumber === id);
      setStudent(studentData || null);
    }
  }, [id]);

  if (isCheckingAuth || student === undefined) {
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
        <h1 className="text-2xl font-bold">Student not found</h1>
        <p className="text-muted-foreground">The student with registration number {id} could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">Edit Student Information</h1>
          <p className="text-muted-foreground">Update the form below with the student's details.</p>
        </div>
        <StudentRegistrationForm studentToEdit={student} />
      </div>
    </div>
  );
}
