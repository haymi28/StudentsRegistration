
import { z } from 'zod';
import type { TFunction } from '@/contexts/locale-provider';

const baseUserSchema = (t: TFunction) => z.object({
  displayName: z.string().min(2, { message: t('validation.min', { field: t('users.form.label.displayName'), length: 2}) }),
  username: z.string().min(3, { message: t('validation.min', { field: t('users.form.label.username'), length: 3}) }),
  roleId: z.string({ required_error: t('users.form.placeholder.selectRole') }),
  isActive: z.boolean().default(true),
});

export const getCreateUserSchema = (t: TFunction = () => '') => 
    baseUserSchema(t).extend({
      password: z.string().min(6, { message: t('validation.min', { field: t('users.form.label.password'), length: 6}) }),
      confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    });


export const getUpdateUserSchema = (t: TFunction = () => '') =>
    baseUserSchema(t).extend({
        password: z.string().min(6, { message: t('validation.min', { field: t('users.form.label.password'), length: 6}) }).optional().or(z.literal('')),
        confirmPassword: z.string().optional()
    }).refine(data => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    });
    
export const getUpdateProfileSchema = (t: TFunction = () => '') => z.object({
    displayName: z.string().min(2, { message: t('validation.min', { field: t('account.displayName'), length: 2}) }),
});

export const getChangePasswordSchema = (t: TFunction = () => '') => z.object({
  currentPassword: z.string().min(1, { message: t('validation.required', { field: t('account.currentPassword') }) }),
  newPassword: z.string().min(6, { message: t('validation.min', { field: t('account.newPassword'), length: 6}) }),
  confirmPassword: z.string().min(1, { message: t('validation.required', { field: t('account.confirmPassword') }) }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: t('validation.passwordMismatch'),
  path: ['confirmPassword'],
});
