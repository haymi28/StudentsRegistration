
'use client';

import { use, useEffect, useState } from 'react';
import { getStudentById, getClasses } from '@/lib/data';
import { EditStudentClient as EditStudentForm } from '@/components/edit-student-client';
import { getServerSession } from '@/lib/auth';
import { MainLayout } from '@/components/common/main-layout';
import { Student, Class } from '@prisma/client';
import { redirect } from 'next/navigation';
import { useLocale } from '@/contexts/locale-provider';
import { extractAppError, isAppError } from '@/lib/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function EditStudentPageClient({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id } = use(paramsPromise);
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionData = await getServerSession();
      if (!sessionData) {
        redirect('/');
        return;
      }
      setIsAuthenticated(true);
      setSession(sessionData);

      try {
        // The backend internally scopes getStudentById() and getClasses()
        const [studentData, classData] = await Promise.all([
          getStudentById(id),
          getClasses(),
        ]);

        if (!studentData) {
          redirect('/students');
          return;
        }

        setStudent(studentData);
        setClasses(classData);
      } catch (e) {
        const appError = extractAppError(e) ?? (isAppError(e) ? e : null);
        if (appError?.code === 'unauthorized') {
          setAccessDeniedMessage(t('common.studentAccessDeniedDescription'));
        } else {
          console.error("Authorization check failed", e);
          redirect('/students');
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndFetch();
  }, [id]);

  if (loading) {
    return (
        <MainLayout isAuthenticated={true}>
            <div className="flex items-center justify-center h-screen">
                {t('common.loading')}
            </div>
        </MainLayout>
    );
  }
  
  if (accessDeniedMessage) {
    return (
      <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8 max-w-2xl mx-auto">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>{t('common.studentAccessDenied')}</AlertTitle>
            <AlertDescription>{accessDeniedMessage}</AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/students">{t('common.back')}</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!student) {
    return (
      <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold">{t('common.studentNotFound')}</h1>
          <p className="text-muted-foreground">{t('common.studentNotFoundDescription')}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
        {session && <EditStudentForm student={student} classes={classes} session={session} />}
    </MainLayout>
  );
}


export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
    return <EditStudentPageClient params={params} />;
}
