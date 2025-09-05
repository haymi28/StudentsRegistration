
import { getServerSession } from '@/lib/auth';
import { getRoles } from '@/lib/data';
import { getTranslator } from '@/lib/i18n';
import { RoleList } from '@/components/role-list';
import { MainLayout } from '@/components/common/main-layout';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

type RoleWithDetails = Role & { _count: { users: number } };

export default async function RolesPage() {
  const t = await getTranslator();
  const session = await getServerSession();
  
  if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_roles !== true) {
    redirect('/students');
  }

  const roles = (await getRoles()) as RoleWithDetails[];

  const translations = {
    title: t('roles.title'),
    description: t('roles.description'),
    createButton: t('roles.createButton'),
    noRoles: t('roles.noRoles'),
    table: {
      name: t('roles.table.name'),
      description: t('roles.table.description'),
      usersCount: t('roles.table.usersCount'),
      actions: t('roles.table.actions'),
    },
    actions: {
        edit: t('students.actions.edit'),
        delete: t('students.actions.delete'),
    },
    deleteDialog: {
      title: t('roles.deleteDialog.title'),
      description: t('roles.deleteDialog.description'),
      descriptionWithUsers: t('roles.deleteDialog.descriptionWithUsers'),
      cancel: t('students.deleteDialog.cancel'),
      confirm: t('students.deleteDialog.confirm'),
    },
    deleteSuccess: {
        title: t('roles.deleteSuccess.title'),
        description: t('roles.deleteSuccess.description')
    },
  };

  return (
    <MainLayout isAuthenticated={!!session}>
        <div className="container py-8 flex flex-col items-center">
            <RoleList roles={roles} translations={translations} />
        </div>
    </MainLayout>
  );
}
