import { z } from 'zod';

type TFunction = (key: string) => string;

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
