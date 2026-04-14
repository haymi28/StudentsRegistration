
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

  // Pass session user ID and role to getStudents to enforce access control
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
