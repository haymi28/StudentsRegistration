
import { StudentList } from '@/components/student-list';
import { getServerSession } from '@/lib/auth';
import { getStudents } from '@/lib/data';
import { MainLayout } from '@/components/common/main-layout';
import { Student, Class, Role } from '@prisma/client';
import { redirect } from 'next/navigation';

type StudentWithClass = Student & { class: Class | null };

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  const awaitedParams = await searchParams;
  const classId = typeof awaitedParams.class === 'string' ? awaitedParams.class : undefined;

  // Security: Pass session identity to the backend to enforce strict scoping.
  // The backend will ignore 'classId' if the user isn't authorized to view all classes.
  const students = await getStudents(session.user.id, session.user.role, classId);

  return (
    <MainLayout isAuthenticated={!!session}>
        <div className="container py-8 flex flex-col items-center">
             <StudentList 
                initialStudents={students as StudentWithClass[]} 
                session={session}
            />
        </div>
    </MainLayout>
  );
}
