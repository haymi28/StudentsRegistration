'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-provider';
import { ExportTable } from './export-table';
import { Student } from '@prisma/client';

interface ExportStudentClientProps {
  students: Student[];
}

export function ExportStudentClient({ students }: ExportStudentClientProps) {
  const { t } = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('export.pageTitle')}</CardTitle>
        <CardDescription>{t('export.pageDescription')}</CardDescription>
      </CardHeader>
      <ExportTable students={students} />
    </Card>
  );
}
