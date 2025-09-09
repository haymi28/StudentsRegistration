
import { z } from 'zod';

// This schema is for server-side validation and does not use translations.
const baseUserSchema = z.object({
  displayName: z.string().min(2),
  username: z.string().min(3),
  isActive: z.boolean().default(true),
});

export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(6),
  roleId: z.string(),
});

export const updateUserSchema = baseUserSchema.extend({
  password: z.string().min(6).optional().or(z.literal('')),
  roleId: z.string().optional(),
});
