
import { getServerSession } from '@/lib/auth';
import { getUsers } from '@/lib/data';
import { getTranslator } from '@/lib/i18n';
import { ClassForm } from '@/components/class-form';
import { MainLayout } from '@/components/common/main-layout';
import { User } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CreateClassPage() {
  const t = await getTranslator();
  const session = await getServerSession();

  if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_classes !== true) {
    redirect('/students');
  }

  const users = await getUsers(true); // Exclude super_admin

  const translations = {
    createTitle: t('classes.form.createTitle'),
    createDescription: t('classes.form.createDescription'),
    labels: {
        name: t('classes.form.label.name'),
        manager: t('classes.form.label.manager'),
    },
    placeholders: {
        name: t('classes.form.placeholder.name'),
        manager: t('classes.form.placeholder.manager'),
    },
    buttons: {
        submit: t('form.submit'),
        loading: t('form.loading'),
    },
    success: {
        title: t('classes.form.createSuccess.title'),
        description: t('classes.form.createSuccess.description'),
    },
  };

  return (
    <MainLayout>
        <div className="container py-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/classes">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('common.back')}
                </Link>
              </Button>
            </div>
            <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{translations.createTitle}</h1>
            <p className="text-muted-foreground">{translations.createDescription}</p>
            </div>
            <ClassForm users={users} translations={translations} />
        </div>
        </div>
    </MainLayout>
  );
}
