
import { UserForm } from "@/components/user-form";
import { getTranslations } from "@/lib/i18n";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/data";

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const session = await getServerSession();
    if (session?.user.role !== 'super_admin') {
        redirect('/students');
    }

    const user = await getUserById(params.id);

    if (!user) {
        return (
            <div className="container py-8 text-center">
              <h1 className="text-2xl font-bold">User Not Found</h1>
              <p className="text-muted-foreground">The user with the given ID could not be found.</p>
            </div>
        );
    }
    
    const t = await getTranslations();
    const translations = {
        title: t('users.form.editTitle'),
        description: t('users.form.editDescription'),
        labels: {
            displayName: t('users.form.label.displayName'),
            username: t('users.form.label.username'),
            password: t('users.form.label.password'),
            confirmPassword: t('users.form.label.confirmPassword'),
            role: t('users.form.label.role'),
            department: t('users.form.label.department'),
            status: t('users.form.label.status'),
            active: t('users.form.label.active'),
            inactive: t('users.form.label.inactive'),
        },
        placeholders: {
            selectRole: t('users.form.placeholder.selectRole'),
            selectDepartment: t('users.form.placeholder.selectDepartment'),
        },
        buttons: {
            submit: t('form.save'),
            loading: t('form.loading'),
        },
        roles: {
            super_admin: t('roles.super_admin'),
            admin: t('roles.admin'),
            teacher: t('roles.teacher'),
        },
        departments: {
            children_1: t('serviceDepartment.children_1'),
            children_2: t('serviceDepartment.children_2'),
            junior: t('serviceDepartment.junior'),
            senior: t('serviceDepartment.senior'),
            youth: t('serviceDepartment.youth'),
        },
        success: {
            title: t('users.form.updateSuccess'),
            description: t('users.form.updateSuccessDescription'),
        }
    };

    return (
        <div className="container py-8">
            <div className="max-w-4xl mx-auto">
                 <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold font-headline">{translations.title}</h1>
                    <p className="text-muted-foreground">{translations.description}</p>
                </div>
                <UserForm userToEdit={user} translations={translations} />
            </div>
        </div>
    );
}
