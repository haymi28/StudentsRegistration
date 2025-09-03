
import { z } from 'zod';

const baseUserSchema = z.object({
  displayName: z.string().min(2, { message: 'Display Name is required' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  roleId: z.string({ required_error: 'Role is required' }),
  isActive: z.boolean().default(true),
});

export const getCreateUserSchema = () => 
    baseUserSchema.extend({
      password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
      confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ['confirmPassword'],
    });


export const getUpdateUserSchema = () =>
    baseUserSchema.extend({
        password: z.string().min(6, { message: 'Password must be at least 6 characters' }).optional().or(z.literal('')),
        confirmPassword: z.string().optional()
    }).refine(data => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ['confirmPassword'],
    });
    
export const getUpdateProfileSchema = () => z.object({
    displayName: z.string().min(2, { message: 'Display Name is required' }),
});

export const getChangePasswordSchema = () => z.object({
  currentPassword: z.string().min(1, { message: 'Current Password is required' }),
  newPassword: z.string().min(6, { message: 'New Password must be at least 6 characters' }),
  confirmPassword: z.string().min(1, { message: 'Confirm New Password is required' }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
