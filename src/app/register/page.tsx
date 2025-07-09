'use client';

import { StudentRegistrationForm } from '@/components/student-registration-form';
import { useLocale } from '@/contexts/locale-provider';

export default function RegisterPage() {
  const { t } = useLocale();

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
