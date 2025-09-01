
import { z } from "zod";

type TFunction = (key: string) => string;

export const getRoleSchema = (t: TFunction) => z.object({
  name: z.string().min(1, { message: t('validation.required').replace('{field}', t('roles.form.label.name')) }),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).min(1, "At least one permission is required."),
});
