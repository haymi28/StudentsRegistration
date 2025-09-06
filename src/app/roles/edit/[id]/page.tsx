
import { getServerSession } from '@/lib/auth';
import { getRoleById } from '@/lib/data';
import { getTranslator } from '@/lib/i18n';
import { RoleForm } from '@/components/role-form';
import { MainLayout } from '@/components/common/main-layout';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditRolePage({ params }: { params: { id: string } }) {
  const t = await getTranslator();
  const session = await getServerSession();

  if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_roles !== true) {
    redirect('/students');
  }

  const roleToEdit = await getRoleById(params.id);

  if (!roleToEdit) {
    redirect('/roles');
  }

  const translations = {
    editTitle: t('roles.form.editTitle'),
    editDescription: t('roles.form.editDescription'),
    labels: {
        name: t('roles.form.label.name'),
        description: t('roles.form.label.description'),
        permissions: t('roles.form.label.permissions'),
    },
    placeholders: {
        name: t('roles.form.placeholder.name'),
        description: t('roles.form.placeholder.description'),
    },
    buttons: {
        submit: t('form.save'),
        loading: t('form.loading'),
    },
    success: {
        title: t('roles.form.updateSuccess.title'),
        description: t('roles.form.updateSuccess.description'),
    },
  };

  return (
    <MainLayout>
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
            <h1 className="text-3xl font-bold font-headline">{translations.editTitle}</h1>
            <p className="text-muted-foreground">{translations.editDescription}</p>
            </div>
            <RoleForm roleToEdit={roleToEdit} translations={translations} />
        </div>
        </div>
    </MainLayout>
  );
}
