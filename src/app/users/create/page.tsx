
import { UserForm } from "@/components/user-form";
import { getTranslator } from "@/lib/i18n";
import { getServerSession } from "@/lib/auth";
import { MainLayout } from "@/components/common/main-layout";
import { redirect } from "next/navigation";

export default async function CreateUserPage() {
    const t = await getTranslator();
    const session = await getServerSession();

    if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_users !== true) {
        redirect('/students');
    }

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
        <MainLayout>
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
