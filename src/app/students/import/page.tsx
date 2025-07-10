
'use client';

import { BulkImportForm } from '@/components/bulk-import-form';
import { useLocale } from '@/contexts/locale-provider';
import { UserRole } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ImportPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('user_role') as UserRole;
    if (role !== 'super_admin') {
      router.replace('/students');
    }
    setUserRole(role);
  }, [router]);
  
  if (userRole !== 'super_admin') {
    return null; // Or a loading/access denied component
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">{t('import.pageTitle')}</h1>
          <p className="text-muted-foreground">{t('import.pageDescription')}</p>
        </div>
        <BulkImportForm />
      </div>
    </div>
  );
}
