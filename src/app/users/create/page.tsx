
'use client';

import { UserForm } from "@/components/user-form";
import { useLocale } from "@/contexts/locale-provider";
import { getServerSession } from "@/lib/auth";
import { MainLayout } from "@/components/common/main-layout";
import { redirect } from "next/navigation";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CreateUserPage() {
    const { t } = useLocale();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const session = await getServerSession();
            if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_users !== true) {
                redirect('/students');
            } else {
                setIsAuthenticated(true);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    if (loading) {
        return (
            <MainLayout isAuthenticated={true}>
                <div className="flex items-center justify-center h-screen">
                    Loading...
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
                        <h1 className="text-3xl font-bold font-headline">{t('users.form.createTitle')}</h1>
                        <p className="text-muted-foreground">{t('users.form.createDescription')}</p>
                    </div>
                    <UserForm />
                </div>
            </div>
        </MainLayout>
    );
}
