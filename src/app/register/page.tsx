
'use client';

import { StudentRegistrationForm } from '@/components/student-registration-form';
import { useLocale } from '@/contexts/locale-provider';
import { MainLayout } from '@/components/common/main-layout';
import { useEffect, useState } from 'react';

export default function RegisterPage() {
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const sessionToken = document.cookie.includes('session=');
    setIsAuthenticated(sessionToken);
  }, []);

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold font-headline">{t('register.pageTitle')}</h1>
                <p className="text-muted-foreground">{t('register.pageDescription')}</p>
            </div>
            <StudentRegistrationForm />
        </div>
        </div>
    </MainLayout>
  );
}
