
'use client';

import { z } from 'zod';
import { UserRole } from '../constants';

type TFunction = (key: string, params?: Record<string, string | number>) => string;

const roles: [UserRole, ...UserRole[]] = ['super_admin', 'admin', 'teacher'];

const baseUserSchema = (t: TFunction) => z.object({
  displayName: z.string().min(2, { message: t('validation.required', { field: t('users.form.label.displayName') }) }),
  username: z.string().min(3, { message: t('validation.min', { field: t('users.form.label.username'), length: '3' }) }),
  role: z.enum(roles, { required_error: t('validation.required', { field: t('users.form.label.role') }) }),
  isActive: z.boolean().default(true),
});

export const getCreateUserSchema = (t: TFunction) => 
    baseUserSchema(t).extend({
      password: z.string().min(6, { message: t('validation.min', { field: t('users.form.label.password'), length: '6' }) }),
      confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    });


export const getUpdateUserSchema = (t: TFunction) =>
    baseUserSchema(t).extend({
        password: z.string().min(6, { message: t('validation.min', { field: t('users.form.label.password'), length: '6' }) }).optional().or(z.literal('')),
        confirmPassword: z.string().optional()
    }).refine(data => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    });


export const getUpdateProfileSchema = (t: TFunction) => z.object({
  displayName: z.string().min(2, { message: t('validation.required', { field: t('account.displayName') }) }),
  username: z.string(),
});

export const getChangePasswordSchema = (t: TFunction) => z.object({
  currentPassword: z.string().min(1, { message: t('validation.required', { field: t('account.currentPassword') }) }),
  newPassword: z.string().min(6, { message: t('validation.min', { field: t('account.newPassword'), length: '6' }) }),
  confirmPassword: z.string().min(1, { message: t('validation.required', { field: t('account.confirmPassword') }) }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: t('validation.passwordMismatch'),
  path: ['confirmPassword'],
});
