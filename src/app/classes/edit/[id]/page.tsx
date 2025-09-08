
'use client';

import { getServerSession } from '@/lib/auth';
import { getClassById, getUsers } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { ClassForm } from '@/components/class-form';
import { MainLayout } from '@/components/common/main-layout';
import { User, Class } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function EditClassPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classToEdit, setClassToEdit] = useState<Class | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const sessionData = await getServerSession();
      if (!sessionData || (sessionData.user.role.permissions as Record<string, boolean>)?.manage_classes !== true) {
        redirect('/students');
        return;
      }
      setIsAuthenticated(true);

      const [classData, userData] = await Promise.all([
        getClassById(id),
        getUsers(true)
      ]);

      if (!classData) {
        redirect('/classes');
        return;
      }
      
      setClassToEdit(classData);
      setUsers(userData);
      setLoading(false);
    };
    checkAuthAndFetchData();
  }, [id]);


  if (loading) {
    return (
        <MainLayout isAuthenticated={true}>
            <div className="flex items-center justify-center h-screen">
                Loading...
            </div>
        </MainLayout>
    )
  }

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/classes">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('common.back')}
                </Link>
              </Button>
            </div>
            <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{t('classes.form.editTitle')}</h1>
            <p className="text-muted-foreground">{t('classes.form.editDescription')}</p>
            </div>
            {classToEdit && <ClassForm classToEdit={classToEdit} users={users} />}
        </div>
        </div>
    </MainLayout>
  );
}
