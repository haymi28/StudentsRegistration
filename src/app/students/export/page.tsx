'use server';

import { ExportClient } from '@/components/export-client';
import { getStudents } from '@/lib/data';
import { getServerSession } from '@/lib/auth';
import { useLocale } from '@/contexts/locale-provider';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';


export default async function ExportStudentsPage() {
  const session = await getServerSession();
  const { t } = useLocale();

  if (!session || session.user.role !== 'super_admin') {
    redirect('/students');
  }

  const students = await getStudents('super_admin');
  
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('export.pageTitle')}</CardTitle>
          <CardDescription>{t('export.pageDescription')}</CardDescription>
        </CardHeader>
        <ExportClient students={students} />
      </Card>
    </div>
  );
}
