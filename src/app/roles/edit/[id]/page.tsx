
import { EditRoleClient } from './edit-role-client';

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  return <EditRoleClient params={params} />;
}
