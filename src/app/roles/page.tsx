
import { getServerSession } from '@/lib/auth';
import { getRoles } from '@/lib/data';
import { RoleList } from '@/components/role-list';
import { MainLayout } from '@/components/common/main-layout';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

type RoleWithDetails = Role & { _count: { users: number } };

export default async function RolesPage() {
  const session = await getServerSession();
  
  if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_roles !== true) {
    redirect('/students');
  }

  const roles = (await getRoles()) as RoleWithDetails[];

  return (
    <MainLayout>
        <div className="container py-8 flex flex-col items-center">
            <RoleList roles={roles} />
        </div>
    </MainLayout>
  );
}
