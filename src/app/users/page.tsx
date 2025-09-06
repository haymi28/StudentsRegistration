
import { getServerSession } from '@/lib/auth';
import { getUsers } from '@/lib/data';
import { UserList } from '@/components/user-list';
import { MainLayout } from '@/components/common/main-layout';
import { User, Role } from '@prisma/client';
import { redirect } from 'next/navigation';

type UserWithRole = User & { role: Role };

export default async function UsersPage() {
  const session = await getServerSession();

  if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_users !== true) {
    redirect('/students');
  }
  
  const users = (await getUsers()) as UserWithRole[];

  return (
    <MainLayout>
        <div className="container py-8 flex flex-col items-center">
            <UserList users={users} />
        </div>
    </MainLayout>
  );
}
