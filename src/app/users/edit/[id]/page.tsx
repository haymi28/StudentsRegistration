
import { UserForm } from "@/components/user-form";
import { getTranslator } from "@/lib/i18n";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/data";

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const session = await getServerSession();
    if (session?.user.role.name !== 'Super Admin') {
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
    
    const t = await getTranslator();
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
        },
        errors: {
            passwordMismatch: t('validation.passwordMismatch'),
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
