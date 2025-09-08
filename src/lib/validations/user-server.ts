
import { z } from 'zod';

// This schema is for server-side validation and does not use translations.
export const updateUserSchema = z.object({
  displayName: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional().or(z.literal('')),
});
