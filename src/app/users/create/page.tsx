
'use client';

import { UserForm } from "@/components/user-form";
import { useLocale } from "@/contexts/locale-provider";
import { getServerSession } from "@/lib/auth";
import { MainLayout } from "@/components/common/main-layout";
import { useState, useEffect } from 'react';
import { redirect } from "next/navigation";

export default function CreateUserPage() {
    const { t } = useLocale();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        const sessionData = await getServerSession();
        setIsAuthenticated(!!sessionData);
        if (!sessionData || sessionData.user.role.name !== 'Super Admin') {
            redirect('/students');
        }
      };
      checkAuth();
    }, []);

    const translations = {
        title: t('users.form.createTitle'),
        description: t('users.form.createDescription'),
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
            submit: t('form.submit'),
            loading: t('form.loading'),
        },
        success: {
            title: t('users.form.createSuccess.title'),
            description: t('users.form.createSuccess.description'),
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
                    <UserForm translations={translations} />
                </div>
            </div>
        </MainLayout>
    );
}
