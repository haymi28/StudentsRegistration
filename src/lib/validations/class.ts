
import { z } from "zod";

type TFunction = (key: string) => string;

export const getCreateClassSchema = (t: TFunction) => z.object({
  name: z.string().min(1, { message: t('validation.required').replace('{field}', t('classes.form.label.name')) }),
  managerId: z.string().min(1, { message: t('validation.required').replace('{field}', t('classes.form.label.manager')) }),
});
