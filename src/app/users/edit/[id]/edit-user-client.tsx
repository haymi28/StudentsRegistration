
'use client';

import { use, useState, useEffect } from 'react';
import { UserForm } from "@/components/user-form";
import { useLocale } from "@/contexts/locale-provider";
import { getServerSession } from "@/lib/auth";
import { getUserById } from "@/lib/data";
import { MainLayout } from "@/components/common/main-layout";
import { User, Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function EditUserClient({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const { id } = use(paramsPromise);
    const { t } = useLocale();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<(User & { role: Role }) | null>(null);

    useEffect(() => {
      const checkAuthAndFetchData = async () => {
        const session = await getServerSession();
        if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_users !== true) {
          redirect('/students');
          return;
        }
        setIsAuthenticated(true);
        
        const userData = (await getUserById(id)) as User & { role: Role };

        if (!userData) {
          redirect('/users');
          return;
        }

        setUser(userData);
        setLoading(false);
      };
      checkAuthAndFetchData();
    }, [id]);

    if (loading) {
        return (
            <MainLayout isAuthenticated={true}>
                <div className="flex items-center justify-center h-screen">
                    {t('common.loading')}
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout isAuthenticated={isAuthenticated}>
            <div className="container py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-4">
                      <Button asChild variant="outline" size="sm">
                        <Link href="/users">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          {t('common.back')}
                        </Link>
                      </Button>
                    </div>
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold font-headline">{t('users.form.editTitle')}</h1>
                        <p className="text-muted-foreground">{t('users.form.editDescription')}</p>
                    </div>
                    {user && <UserForm userToEdit={user} />}
                </div>
            </div>
        </MainLayout>
    );
}
