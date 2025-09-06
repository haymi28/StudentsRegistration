
import { getServerSession } from '@/lib/auth';
import { getTranslator } from '@/lib/i18n';
import { RoleForm } from '@/components/role-form';
import { MainLayout } from '@/components/common/main-layout';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CreateRolePage() {
  const t = await getTranslator();
  const session = await getServerSession();

  if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_roles !== true) {
    redirect('/students');
  }

  const translations = {
    createTitle: t('roles.form.createTitle'),
    createDescription: t('roles.form.createDescription'),
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
        submit: t('roles.form.createButton'),
        loading: t('form.loading'),
    },
    success: {
        title: t('roles.form.createSuccess.title'),
        description: t('roles.form.createSuccess.description'),
    },
  };

  return (
    <MainLayout>
        <div className="container py-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Link href="/roles">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('common.back')}
                </Button>
              </Link>
            </div>
            <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{translations.createTitle}</h1>
            <p className="text-muted-foreground">{translations.createDescription}</p>
            </div>
            <RoleForm translations={translations} />
        </div>
        </div>
    </MainLayout>
  );
}
