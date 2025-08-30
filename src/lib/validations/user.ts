
'use client';

import { z } from 'zod';
import { UserRole } from '../constants';

type TFunction = (key: string, params?: Record<string, string | number>) => string;

const roles: [UserRole, ...UserRole[]] = ['super_admin', 'admin', 'teacher'];

const baseUserSchema = (t: TFunction) => z.object({
  displayName: z.string().min(2, { message: t('validation.required', { field: t('users.form.label.displayName') }) }),
  username: z.string().min(3, { message: t('validation.min', { field: t('users.form.label.username'), length: '3' }) }),
  role: z.enum(roles, { required_error: t('validation.required', { field: t('users.form.label.role') }) }),
  serviceDepartment: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

const refinement = (t: TFunction) => (data: any, ctx: z.RefinementCtx) => {
    if ((data.role === 'admin' || data.role === 'teacher') && !data.serviceDepartment) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.departmentRequired'),
            path: ['serviceDepartment'],
        });
    }
    if (data.role === 'super_admin') {
      if (data.serviceDepartment) {
        data.serviceDepartment = null;
      }
    }
};

export const getCreateUserSchema = (t: TFunction) => 
    baseUserSchema(t).extend({
      password: z.string().min(6, { message: t('validation.min', { field: t('users.form.label.password'), length: '6' }) }),
      confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    }).superRefine(refinement(t));


export const getUpdateUserSchema = (t: TFunction) =>
    baseUserSchema(t).extend({
        password: z.string().min(6, { message: t('validation.min', { field: t('users.form.label.password'), length: '6' }) }).optional().or(z.literal('')),
        confirmPassword: z.string().optional()
    }).refine(data => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    }).superRefine(refinement(t));


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
