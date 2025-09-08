
'use client';

import { getServerSession } from '@/lib/auth';
import { getRoleById } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { RoleForm } from '@/components/role-form';
import { MainLayout } from '@/components/common/main-layout';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Role } from '@prisma/client';

export default function EditRolePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const sessionData = await getServerSession();
      if (!sessionData || (sessionData.user.role.permissions as Record<string, boolean>)?.manage_roles !== true) {
        redirect('/students');
        return;
      }
      setIsAuthenticated(true);
      
      const roleData = await getRoleById(id);

      if (!roleData) {
        redirect('/roles');
        return;
      }
      
      setRoleToEdit(roleData);
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
                <Link href="/roles">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('common.back')}
                </Link>
              </Button>
            </div>
            <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{t('roles.form.editTitle')}</h1>
            <p className="text-muted-foreground">{t('roles.form.editDescription')}</p>
            </div>
            {roleToEdit && <RoleForm roleToEdit={roleToEdit} />}
        </div>
        </div>
    </MainLayout>
  );
}
