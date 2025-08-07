'use client';

import { useAuth } from '@/contexts/auth-provider';
import { CreateAdminForm } from '@/components/create-admin-form';
import { AdminList } from '@/components/admin-list';
import { useLocale } from '@/contexts/locale-provider';
import { User } from '@prisma/client';
import { useEffect, useState } from 'react';
import { getUsers } from '@/lib/data';

export default function AccountPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const allUsers = await getUsers();
        // Filter out the super_admin to only show other admins
        setAdmins(allUsers.filter(u => u.role !== 'super_admin'));
      } catch (error) {
        console.error("Failed to fetch admins", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'super_admin') {
      fetchAdmins();
    }
  }, [user]);

  if (user?.role !== 'super_admin') {
    return (
        <div className="container py-8 text-center">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-headline">{t('account.pageTitle')}</h1>
        <p className="text-muted-foreground">{t('account.pageDescription')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">{t('account.createAdminTitle')}</h2>
          <CreateAdminForm onAdminCreated={(newAdmin) => setAdmins(prev => [...prev, newAdmin])} />
        </div>
        <div>
           <h2 className="text-2xl font-semibold mb-4">{t('account.adminListTitle')}</h2>
           <AdminList admins={admins} loading={loading} />
        </div>
      </div>
    </div>
  );
}
