
import { UserForm } from "@/components/user-form";
import { getTranslator } from "@/lib/i18n";
import { getServerSession } from "@/lib/auth";
import { getUserById } from "@/lib/data";
import { MainLayout } from "@/components/common/main-layout";
import { User, Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const t = await getTranslator();
    const session = await getServerSession();

    if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_users !== true) {
      redirect('/students');
    }

    const user = (await getUserById(id)) as User & { role: Role };

    if (!user) {
        redirect('/users');
    }

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
        <MainLayout>
            <div className="container py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold font-headline">{translations.title}</h1>
                        <p className="text-muted-foreground">{translations.description}</p>
                    </div>
                    <UserForm userToEdit={user} translations={translations} />
                </div>
            </div>
        </MainLayout>
    );
}
