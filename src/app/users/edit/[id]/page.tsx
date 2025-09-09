
import { EditUserClient } from './edit-user-client';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditUserClient params={params} />;
}
