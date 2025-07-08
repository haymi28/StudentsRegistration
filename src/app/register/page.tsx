'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentRegistrationForm } from '@/components/student-registration-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale } from '@/contexts/locale-provider';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  if (isCheckingAuth) {
    return (
        <div className="container py-8">
            <div className="space-y-4 max-w-4xl mx-auto">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-[600px] w-full" />
            </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{t('register.pageTitle')}</h1>
            <p className="text-muted-foreground">{t('register.pageDescription')}</p>
        </div>
        <StudentRegistrationForm />
      </div>
    </div>
  );
}
