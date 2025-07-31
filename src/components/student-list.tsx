
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getStudents } from '@/lib/data';
import { StudentActions } from './student-actions';
import { useLocale } from '@/contexts/locale-provider';
import { Student } from '@prisma/client';
import { Skeleton } from './ui/skeleton';

export function StudentList() {
  const { t } = useLocale();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const studentData = await getStudents();
        setStudents(studentData);
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const translations = {
    title: t('students.title'),
    descriptionSuperAdmin: t('students.descriptionSuperAdmin'),
    searchPlaceholder: t('students.searchPlaceholder'),
    noStudents: t('students.noStudents'),
    rowActions: {
      actions: t('students.table.actions'),
      view: t('students.actions.view'),
      edit: t('students.actions.edit'),
      delete: t('students.actions.delete'),
      deleteSuccess: t('students.deleteSuccess'),
      deleteSuccessDescription: t('students.deleteSuccessDescription'),
      deleteDialog: {
        title: t('students.deleteDialog.title'),
        description: t('students.deleteDialog.description'),
        cancel: t('students.deleteDialog.cancel'),
        confirm: t('students.deleteDialog.confirm'),
      }
    }
  };
  
  const StudentListSkeleton = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="border rounded-lg p-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-grow">
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>{translations.descriptionSuperAdmin}</CardDescription>
        </div>
        {!loading && (
            <StudentActions 
                students={students}
                translations={{
                    searchPlaceholder: translations.searchPlaceholder,
                    row: translations.rowActions
                }}
            />
        )}
      </CardHeader>
      <CardContent>
        {loading ? <StudentListSkeleton /> : null}
      </CardContent>
    </Card>
  );
}
