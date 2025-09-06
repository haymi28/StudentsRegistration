
import { z } from "zod";

export const getRoleSchema = () => z.object({
  name: z.string().min(1, { message: 'Role Name is required' }),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]).optional(),
});
