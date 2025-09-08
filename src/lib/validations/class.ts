
import { z } from "zod";
import type { TFunction } from '@/contexts/locale-provider';

export const getCreateClassSchema = (t: TFunction = () => '') => z.object({
  name: z.string().min(1, { message: t('validation.required', { field: t('classes.form.label.name') }) || 'Class Name is required' }),
  managerId: z.string().min(1, { message: t('validation.required', { field: t('classes.form.label.manager') }) || 'Class Manager is required' }),
});
