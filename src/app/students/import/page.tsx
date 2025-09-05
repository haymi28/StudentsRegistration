
'use client';

import { BulkImportForm } from '@/components/bulk-import-form';
import { useLocale } from '@/contexts/locale-provider';
import { getServerSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/common/main-layout';

export default function ImportPage() {
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    const checkAuth = async () => {
        const session = await getServerSession();
        if (!session) {
            router.replace('/');
            return;
        }
        const permissions = session.user.role.permissions as Record<string, boolean>;
        if (!permissions?.import_students) {
            router.replace('/students');
        }
    };
    checkAuth();
  }, [router]);
  

  return (
    <MainLayout>
        <div className="container py-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{t('import.pageTitle')}</h1>
            <p className="text-muted-foreground">{t('import.pageDescription')}</p>
            </div>
            <BulkImportForm />
        </div>
        </div>
    </MainLayout>
  );
}
