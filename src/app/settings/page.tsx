import { MainLayout } from '@/components/common/main-layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getTranslator } from '@/lib/i18n';
import { requireAnyPermission } from '@/lib/auth';
import { Home, Shield, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const session = await requireAnyPermission(['manage_classes', 'manage_users', 'manage_roles']);
  const t = await getTranslator();

  const permissions = session.user.role.permissions as Record<string, boolean> || {};
  
  const settingsCards = [
    { 
      href: '/classes', 
      label: t('nav.classManagement'), 
      description: t('classes.description'), 
      icon: Home, 
      permission: 'manage_classes' 
    },
    { 
      href: '/users', 
      label: t('nav.userManagement'), 
      description: t('users.description'), 
      icon: Shield, 
      permission: 'manage_users' 
    },
    { 
      href: '/roles', 
      label: t('nav.roleManagement'), 
      description: t('roles.description'), 
      icon: ShieldCheck, 
      permission: 'manage_roles' 
    },
  ];

  const visibleCards = settingsCards.filter(card => permissions[card.permission]);

  return (
    <MainLayout isAuthenticated={true}>
        <div className="container py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold font-headline">{t('settings.pageTitle')}</h1>
                <p className="text-muted-foreground">{t('settings.pageDescription')}</p>
            </div>
            {visibleCards.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <h2 className="text-xl font-semibold text-foreground mb-2">{t('settings.noAccessTitle')}</h2>
                <p>{t('settings.noAccessDescription')}</p>
              </div>
            ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleCards.map((card) => (
                    <Link href={card.href} key={card.href} className="block h-full">
                        <Card className="h-full hover:bg-muted/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <card.icon className="h-8 w-8 text-primary" />
                                    <div>
                                        <CardTitle>{card.label}</CardTitle>
                                        <CardDescription className="mt-1">{card.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
            )}
        </div>
    </MainLayout>
  );
}
