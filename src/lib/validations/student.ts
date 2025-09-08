
import { z } from "zod";
import { TFunction } from "@/contexts/locale-provider";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const getMinError = (t: TFunction, fieldKey: string, length: number) => ({
    message: t ? t('validation.min', { field: t(fieldKey), length }) : `${fieldKey} must be at least ${length} characters.`,
});

export const getStudentRegistrationSchema = (t?: TFunction) => {
    const required = (fieldKey: string) => t ? t('validation.required', { field: t(fieldKey) }) : 'This field is required';
    const invalidNumber = t ? t('validation.invalidNumber') : 'Invalid number';
    const minMessage = (fieldKey: string, length: number) => t ? t('validation.min', { field: t(fieldKey), length }) : `Must be at least ${length} characters`;

    return z.object({
        photo: z.string().optional(),
        registrationNumber: z.string({ required_error: required('form.label.regNumber') }).min(1, { message: required('form.label.regNumber') }),
        fullName: z.string({ required_error: required('form.label.fullName') }).min(2, { message: minMessage('form.label.fullName', 2) }),
        gender: z.string({ required_error: required('form.label.gender') }).min(1, { message: required('form.label.gender') }),
        classId: z.string({ required_error: required('form.label.department') }).min(1, { message: required('form.label.department') }),
        baptismalName: z.string().optional(),
        mothersName: z.string().optional(),
        dateOfBirth: z.string().optional(),
        educationLevel: z.string().optional(),
        fathersPhoneNumber: z.string().regex(phoneRegex, invalidNumber).optional().or(z.literal('')),
        mothersPhoneNumber: z.string().regex(phoneRegex, invalidNumber).optional().or(z.literal('')),
        additionalPhoneNumber: z.string().regex(phoneRegex, invalidNumber).optional().or(z.literal('')),
        phoneNumber: z.string({ required_error: required('form.label.phone') }).regex(phoneRegex, invalidNumber).min(9, { message: required('form.label.phone') }),
        subcity: z.string().optional(),
        kebele: z.string().optional(),
        houseNumber: z.string().optional(),
        specificAddress: z.string().optional(),
        dateOfJoining: z.string().optional(),
    });
};
