'use client';

import { User } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/contexts/locale-provider';
import { roleToServiceDepartmentMap, ServiceDepartment } from '@/lib/constants';
import { Skeleton } from './ui/skeleton';

interface AdminListProps {
  admins: User[];
  loading: boolean;
}

export function AdminList({ admins, loading }: AdminListProps) {
  const { t } = useLocale();

  const getDepartmentName = (role: string) => {
    if (role === 'super_admin') return 'Super Admin';
    const departmentKey = roleToServiceDepartmentMap[role as keyof typeof roleToServiceDepartmentMap];
    
    // Find the key in serviceDepartment translations that matches the department value
    const departmentTranslations = t('serviceDepartment');
    const deptKey = Object.keys(departmentTranslations).find(key => departmentTranslations[key] === departmentKey);

    return deptKey ? t(`serviceDepartment.${deptKey}`) : departmentKey;
  };
  
  if (loading) {
      return (
          <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
      )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('account.username')}</TableHead>
              <TableHead>{t('account.displayName')}</TableHead>
              <TableHead>{t('account.role')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length > 0 ? admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.username}</TableCell>
                <TableCell>{admin.displayName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{getDepartmentName(admin.role)}</Badge>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                        {t('account.noAdmins')}
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
