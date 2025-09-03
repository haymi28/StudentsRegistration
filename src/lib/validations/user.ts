
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


export const getUpdateProfileSchema = (t: (key: string, params?: Record<string, string | number>) => string) => z.object({
  displayName: z.string().min(2, { message: t('validation.required', { field: t('account.displayName') }) }),
  username: z.string(),
});

export const getChangePasswordSchema = (t: (key: string, params?: Record<string, string | number>) => string) => z.object({
  currentPassword: z.string().min(1, { message: t('validation.required', { field: t('account.currentPassword') }) }),
  newPassword: z.string().min(6, { message: t('validation.min', { field: t('account.newPassword'), length: 6 }) }),
  confirmPassword: z.string().min(1, { message: t('validation.required', { field: t('account.confirmPassword') }) }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: t('validation.passwordMismatch'),
  path: ['confirmPassword'],
});
