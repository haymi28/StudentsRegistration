
'use client';

import { getStudentById, getClasses } from '@/lib/data';
import { EditStudentClient } from '@/components/edit-student-client';
import { getServerSession } from '@/lib/auth';
import { MainLayout } from '@/components/common/main-layout';
import { useEffect, useState } from 'react';
import { Student, Class } from '@prisma/client';
import { redirect } from 'next/navigation';

export default function EditStudentPage({ params }: { params: { id: string }}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionData = await getServerSession();
      setIsAuthenticated(!!sessionData);
      setSession(sessionData);

      if (!sessionData) {
        redirect('/');
      } else {
        const [studentData, classData] = await Promise.all([
          getStudentById(params.id),
          getClasses(),
        ]);
        setStudent(studentData);
        setClasses(classData);
      }
      setLoading(false);
    };
    checkAuthAndFetch();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }
  
  if (!student) {
    return (
      <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold">Student Not Found</h1>
          <p className="text-muted-foreground">The student with the given ID could not be found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
        {session && <EditStudentClient student={student} classes={classes} session={session} />}
    </MainLayout>
  );
}
