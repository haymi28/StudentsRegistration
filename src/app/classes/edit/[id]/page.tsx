
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { getClassById, getUsers } from '@/lib/data';
import { getTranslations } from '@/lib/i18n';
import { ClassForm } from '@/components/class-form';

export default async function EditClassPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (session?.user.role.name !== 'Super Admin') {
    redirect('/students');
  }

  const classToEdit = await getClassById(params.id);
  if (!classToEdit) {
    return (
        <div className="container py-8 text-center">
            <h1 className="text-2xl font-bold">Class Not Found</h1>
            <p className="text-muted-foreground">The class with the given ID could not be found.</p>
        </div>
    );
  }

  const users = await getUsers(true);
  const t = await getTranslations();

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
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">{translations.editTitle}</h1>
          <p className="text-muted-foreground">{translations.editDescription}</p>
        </div>
        <ClassForm classToEdit={classToEdit} users={users} translations={translations} />
      </div>
    </div>
  );
}
