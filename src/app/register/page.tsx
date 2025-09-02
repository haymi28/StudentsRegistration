
import { StudentRegistrationForm } from '@/components/student-registration-form';
import { getTranslator } from '@/lib/i18n';
import { getServerSession } from '@/lib/auth';
import { getClasses } from '@/lib/data';
import { MainLayout } from '@/components/common/main-layout';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await getServerSession();
  if (!session) {
    redirect('/');
  }

  const classes = await getClasses();
  const t = await getTranslator();

  return (
    <MainLayout isAuthenticated={!!session}>
        <div className="container py-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold font-headline">{t('register.pageTitle')}</h1>
                <p className="text-muted-foreground">{t('register.pageDescription')}</p>
            </div>
            <StudentRegistrationForm 
              session={session}
              classes={classes} 
            />
        </div>
        </div>
    </MainLayout>
  );
}
