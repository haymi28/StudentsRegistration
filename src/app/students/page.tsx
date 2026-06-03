
import { StudentList } from '@/components/student-list';
import { getServerSession } from '@/lib/auth';
import { getStudents } from '@/lib/data';
import { MainLayout } from '@/components/common/main-layout';
import { Student, Class } from '@prisma/client';
import { redirect } from 'next/navigation';
import { extractAppError, isAppError } from '@/lib/errors';
import { getTranslator } from '@/lib/i18n';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

type StudentWithClass = Student & { class: Class | null };

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  const t = await getTranslator();
  const awaitedParams = await searchParams;
  const classId = typeof awaitedParams.class === 'string' ? awaitedParams.class : undefined;

  let students: StudentWithClass[] = [];
  let accessDeniedMessage: string | null = null;

  try {
    students = (await getStudents(classId)) as StudentWithClass[];
  } catch (error) {
    const appError = extractAppError(error) ?? (isAppError(error) ? error : null);
    if (appError?.code === 'unauthorized') {
      accessDeniedMessage = t('common.studentAccessDeniedDescription');
    } else {
      throw error;
    }
  }

  return (
    <MainLayout isAuthenticated={!!session}>
        <div className="container py-8 flex flex-col items-center">
            {accessDeniedMessage && (
              <Alert variant="destructive" className="mb-6 max-w-5xl w-full">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>{t('common.studentAccessDenied')}</AlertTitle>
                <AlertDescription>{accessDeniedMessage}</AlertDescription>
              </Alert>
            )}
             <StudentList 
                initialStudents={students} 
                session={session}
            />
        </div>
    </MainLayout>
  );
}
