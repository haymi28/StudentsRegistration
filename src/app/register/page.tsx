
'use client';

import { StudentRegistrationForm } from '@/components/student-registration-form';
import { useLocale } from '@/contexts/locale-provider';
import { getServerSession } from '@/lib/auth';
import { getClasses } from '@/lib/data';
import { MainLayout } from '@/components/common/main-layout';
import { useEffect, useState } from 'react';
import { Class } from '@prisma/client';
import { redirect } from 'next/navigation';

export default function RegisterPage() {
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionData = await getServerSession();
      if (!sessionData) {
        redirect('/');
        return;
      }
      setIsAuthenticated(true);
      setSession(sessionData);

      const classData = await getClasses();
      setClasses(classData);
    };
    checkAuthAndFetch();
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{t('register.pageTitle')}</h1>
            <p className="text-muted-foreground">{t('register.pageDescription')}</p>
          </div>
          {session && (
             <StudentRegistrationForm 
                session={session}
                classes={classes} 
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
