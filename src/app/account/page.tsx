
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { UpdateProfileForm } from '@/components/update-profile-form';
import { ChangePasswordForm } from '@/components/change-password-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/components/common/main-layout';
import { getTranslator } from '@/lib/i18n';

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) {
    redirect('/');
  }

  const t = await getTranslator();

  return (
    <MainLayout isAuthenticated={!!session}>
        <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
            <h1 className="text-3xl font-bold font-headline">{t('account.pageTitle')}</h1>
            <p className="text-muted-foreground">{t('account.pageDescription')}</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                <CardTitle>{t('account.updateProfileTitle')}</CardTitle>
                <CardDescription>{t('account.updateProfileDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                <UpdateProfileForm />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>{t('account.changePasswordTitle')}</CardTitle>
                <CardDescription>{t('account.changePasswordDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                <ChangePasswordForm />
                </CardContent>
            </Card>
            </div>
        </div>
        </div>
    </MainLayout>
  );
}
