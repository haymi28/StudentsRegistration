
'use client';

import { ImportPhotosForm } from '@/components/import-photos-form';
import { useLocale } from '@/contexts/locale-provider';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/common/main-layout';
import { useEffect, useState } from 'react';

export default function ImportPhotosPage() {
  const { t } = useLocale();
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const sessionData = await getServerSession();
      if (!sessionData) {
        redirect('/');
        return;
      }
      const permissions = sessionData.user.role.permissions as Record<string, boolean>;
      if (!permissions?.import_students) {
        redirect('/students');
        return;
      }
      setIsAuthenticated(true);
      setSession(sessionData);
    };
    checkAuth();
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{t('importPhotos.pageTitle')}</h1>
            <p className="text-muted-foreground">{t('importPhotos.pageDescription')}</p>
          </div>
          <ImportPhotosForm />
        </div>
      </div>
    </MainLayout>
  );
}
