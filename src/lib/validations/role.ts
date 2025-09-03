
import { z } from "zod";

export const getRoleSchema = () => z.object({
  name: z.string().min(1, { message: 'Role Name is required' }),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).min(1, "At least one permission is required."),
});
