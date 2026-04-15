
import { StudentList } from '@/components/student-list';
import { getServerSession } from '@/lib/auth';
import { getStudents } from '@/lib/data';
import { MainLayout } from '@/components/common/main-layout';
import { Student, Class } from '@prisma/client';
import { redirect } from 'next/navigation';

type StudentWithClass = Student & { class: Class | null };

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  const awaitedParams = await searchParams;
  const classId = typeof awaitedParams.class === 'string' ? awaitedParams.class : undefined;

  // The backend internally scopes getStudents() based on its own call to getServerSession().
  // It will ignore 'classId' if the user isn't authorized to view all classes.
  const students = await getStudents(classId);

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
