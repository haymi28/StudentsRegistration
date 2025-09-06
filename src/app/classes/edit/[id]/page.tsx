
import { getServerSession } from '@/lib/auth';
import { getClassById, getUsers } from '@/lib/data';
import { getTranslator } from '@/lib/i18n';
import { ClassForm } from '@/components/class-form';
import { MainLayout } from '@/components/common/main-layout';
import { User } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditClassPage({ params }: { params: { id: string } }) {
  const t = await getTranslator();
  const session = await getServerSession();

  if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_classes !== true) {
    redirect('/students');
  }

  const [classToEdit, users] = await Promise.all([
    getClassById(params.id),
    getUsers(true)
  ]);

  if (!classToEdit) {
    redirect('/classes');
  }
  
  const translations = {
    editTitle: t('classes.form.editTitle'),
    editDescription: t('classes.form.editDescription'),
    labels: {
        name: t('classes.form.label.name'),
        manager: t('classes.form.label.manager'),
    },
    placeholders: {
        name: t('classes.form.placeholder.name'),
        manager: t('classes.form.placeholder.manager'),
    },
    buttons: {
        submit: t('form.save'),
        loading: t('form.loading'),
    },
    success: {
        title: t('classes.form.updateSuccess.title'),
        description: t('classes.form.updateSuccess.description'),
    },
  };

  return (
    <MainLayout>
        <div className="container py-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Link href="/classes">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('common.back')}
                </Button>
              </Link>
            </div>
            <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">{translations.editTitle}</h1>
            <p className="text-muted-foreground">{translations.editDescription}</p>
            </div>
            <ClassForm classToEdit={classToEdit} users={users} translations={translations} />
        </div>
        </div>
    </MainLayout>
  );
}
