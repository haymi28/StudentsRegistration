'use client';

import { UpdateProfileForm } from '@/components/update-profile-form';
import { ChangePasswordForm } from '@/components/change-password-form';
import { useLocale } from '@/contexts/locale-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AccountPage() {
  const { t } = useLocale();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">{t('account.pageTitle')}</h1>
        <p className="text-muted-foreground">{t('account.pageDescription')}</p>
      </div>
      <div className="grid gap-8">
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
  );
}
