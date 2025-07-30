import { z } from "zod";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

type TFunction = (key: string) => string;

export const getStudentRegistrationSchema = (t: TFunction) => z.object({
  photo: z.string().optional(),
  registrationNumber: z.string().min(1, { message: t('validation.required').replace('{field}', t('form.label.regNumber')) }),
  fullName: z.string().min(2, { message: t('validation.required').replace('{field}', t('form.label.fullName')) }),
  gender: z.string({ required_error: t('validation.required').replace('{field}', t('form.label.gender')) }).min(1, { message: t('validation.required').replace('{field}', t('form.label.gender')) }),
  serviceDepartment: z.string({ required_error: t('validation.required').replace('{field}', t('form.label.department')) }).min(1, { message: t('validation.required').replace('{field}', t('form.label.department')) }),
  baptismalName: z.string().optional(),
  mothersName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  educationLevel: z.string().min(1, { message: t('validation.required').replace('{field}', t('form.label.education')) }),
  fathersPhoneNumber: z.string().regex(phoneRegex, t('validation.invalidNumber')).optional().or(z.literal('')),
  mothersPhoneNumber: z.string().regex(phoneRegex, t('validation.invalidNumber')).optional().or(z.literal('')),
  additionalPhoneNumber: z.string().regex(phoneRegex, t('validation.invalidNumber')).optional().or(z.literal('')),
  phoneNumber: z.string().regex(phoneRegex, t('validation.invalidNumber')).min(9, { message: t('validation.required').replace('{field}', t('form.label.phone')) }),
  subcity: z.string().min(1, { message: t('validation.required').replace('{field}', t('form.label.subcity')) }),
  kebele: z.string().min(1, { message: t('validation.required').replace('{field}', t('form.label.kebele')) }),
  houseNumber: z.string().min(1, { message: t('validation.required').replace('{field}', t('form.label.houseNumber')) }),
  specificAddress: z.string().min(5, { message: t('validation.required').replace('{field}', t('form.label.specificAddress')) }),
  dateOfJoining: z.string().optional(),
});
