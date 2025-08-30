
import { z } from 'zod';
import { UserRole, serviceDepartments } from '../constants';

type TFunction = (key: string) => string;

const roles: [UserRole, ...UserRole[]] = ['super_admin', 'admin', 'teacher'];

export const getBaseUserSchema = (t: TFunction) => z.object({
  displayName: z.string().min(2, { message: t('validation.required').replace('{field}', t('users.form.label.displayName')) }),
  username: z.string().min(3, { message: t('validation.min').replace('{field}', t('users.form.label.username')).replace('{length}', '3') }),
  role: z.enum(roles, { required_error: t('validation.required').replace('{field}', t('users.form.label.role')) }),
  serviceDepartment: z.string().optional(),
  isActive: z.boolean().default(true),
}).superRefine((data, ctx) => {
    if ((data.role === 'admin' || data.role === 'teacher') && !data.serviceDepartment) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.departmentRequired'),
            path: ['serviceDepartment'],
        });
    }
    if (data.role === 'super_admin') {
        data.serviceDepartment = null;
    }
});


export const getCreateUserSchema = (t: TFunction) => getBaseUserSchema(t).extend({
    password: z.string().min(6, { message: t('validation.min').replace('{field}', t('users.form.label.password')).replace('{length}', '6') }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: t('validation.passwordMismatch'),
  path: ['confirmPassword'],
});

export const getUpdateUserSchema = (t: TFunction) => getBaseUserSchema(t).extend({
    password: z.string().min(6, { message: t('validation.min').replace('{field}', t('users.form.label.password')).replace('{length}', '6') }).optional().or(z.literal('')),
    confirmPassword: z.string().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: t('validation.passwordMismatch'),
  path: ['confirmPassword'],
});


export const getUpdateProfileSchema = (t: TFunction) => z.object({
  displayName: z.string().min(2, { message: t('validation.required').replace('{field}', t('account.displayName')) }),
  username: z.string(),
});

export const getChangePasswordSchema = (t: TFunction) => z.object({
  currentPassword: z.string().min(1, { message: t('validation.required').replace('{field}', t('account.currentPassword')) }),
  newPassword: z.string().min(6, { message: t('validation.min').replace('{field}', t('account.newPassword')).replace('{length}', '6') }),
  confirmPassword: z.string().min(1, { message: t('validation.required').replace('{field}', t('account.confirmPassword')) }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: t('validation.passwordMismatch'),
  path: ['confirmPassword'],
});
