
import { z } from "zod";
import { TFunction } from "@/contexts/locale-provider";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);


export const getStudentRegistrationSchema = (t: TFunction) => z.object({
  photo: z.string().optional(),
  registrationNumber: z.string({ required_error: t('validation.required', { field: t('form.label.regNumber') }) }).min(1, { message: t('validation.required', { field: t('form.label.regNumber') }) }),
  fullName: z.string({ required_error: t('validation.required', { field: t('form.label.fullName') }) }).min(2, { message: t('validation.required', { field: t('form.label.fullName') }) }),
  gender: z.string({ required_error: t('validation.required', { field: t('form.label.gender') }) }).min(1, { message: t('validation.required', { field: t('form.label.gender') }) }),
  classId: z.string({ required_error: t('validation.required', { field: t('form.label.department') }) }).min(1, { message: t('validation.required', { field: t('form.label.department') }) }),
  baptismalName: z.string().optional(),
  mothersName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  educationLevel: z.string().optional(),
  fathersPhoneNumber: z.string().regex(phoneRegex, t('validation.invalidNumber')).optional().or(z.literal('')),
  mothersPhoneNumber: z.string().regex(phoneRegex, t('validation.invalidNumber')).optional().or(z.literal('')),
  additionalPhoneNumber: z.string().regex(phoneRegex, t('validation.invalidNumber')).optional().or(z.literal('')),
  phoneNumber: z.string({ required_error: t('validation.required', { field: t('form.label.phone') }) }).regex(phoneRegex, t('validation.invalidNumber')).min(9, { message: t('validation.required', { field: t('form.label.phone') }) }),
  subcity: z.string().optional(),
  kebele: z.string().optional(),
  houseNumber: z.string().optional(),
  specificAddress: z.string().optional(),
  dateOfJoining: z.string().optional(),
});
