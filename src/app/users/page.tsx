
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { getUsers } from '@/lib/data';
import { UserList } from '@/components/user-list';

export default async function UsersPage() {
  const session = await getServerSession();
  
  if (!session || session.user.role !== 'super_admin') {
    redirect('/students');
  }

  const users = await getUsers();

  return (
    <div className="container py-8 flex flex-col items-center">
      <UserList users={users} />
    </div>
  );
}
