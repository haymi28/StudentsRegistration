
'use client';

import { UserForm } from "@/components/user-form";
import { useLocale } from "@/contexts/locale-provider";
import { getServerSession } from "@/lib/auth";
import { getUserById } from "@/lib/data";
import { MainLayout } from "@/components/common/main-layout";
import { useState, useEffect } from 'react';
import { User, Role } from '@prisma/client';

export default function EditUserPage({ params }: { params: { id: string } }) {
    const { t } = useLocale();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<(User & { role: Role }) | null>(null);

    useEffect(() => {
      const checkAuthAndFetch = async () => {
        const sessionData = await getServerSession();
        setIsAuthenticated(!!sessionData);
        if (sessionData?.user.role.name === 'Super Admin') {
          const userData = await getUserById(params.id);
          setUser(userData as User & { role: Role });
        }
      };
      checkAuthAndFetch();
    }, [params.id]);

    const translations = {
        title: t('users.form.editTitle'),
        description: t('users.form.editDescription'),
        labels: {
            displayName: t('users.form.label.displayName'),
            username: t('users.form.label.username'),
            password: t('users.form.label.password'),
            confirmPassword: t('users.form.label.confirmPassword'),
            role: t('users.form.label.role'),
            status: t('users.form.label.status'),
            active: t('users.form.label.active'),
            inactive: t('users.form.label.inactive'),
        },
        placeholders: {
            selectRole: t('users.form.placeholder.selectRole'),
            password: t('users.form.placeholder.passwordOptional')
        },
        buttons: {
            submit: t('form.save'),
            loading: t('form.loading'),
        },
        success: {
            title: t('users.form.updateSuccess.title'),
            description: t('users.form.updateSuccess.description'),
        }
    };

    return (
        <MainLayout isAuthenticated={isAuthenticated}>
            <div className="container py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold font-headline">{translations.title}</h1>
                        <p className="text-muted-foreground">{translations.description}</p>
                    </div>
                    {user && <UserForm userToEdit={user} translations={translations} />}
                </div>
            </div>
        </MainLayout>
    );
}
