
import { z } from "zod";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

export interface StudentValidationTranslations {
  required: (field: string) => string;
  min: (field: string, length: number) => string;
  invalidNumber: string;
}

const defaultTranslations: StudentValidationTranslations = {
  required: (field: string) => `${field} is required.`,
  min: (field: string, length: number) => `${field} must be at least ${length} characters.`,
  invalidNumber: 'Invalid number.',
};

export const getStudentRegistrationSchema = (translations: Partial<StudentValidationTranslations> = {}) => {
    const t = { ...defaultTranslations, ...translations };
    
    // We assume field names are handled by the caller who passes the translated field name into the required/min functions.
    const fields = {
        regNumber: 'Registration Number',
        fullName: 'Full Name',
        gender: 'Gender',
        classId: 'Class',
        phone: 'Phone Number'
    };

    return z.object({
        photo: z.string().optional(),
        registrationNumber: z.string().min(1, { message: t.required(fields.regNumber) }),
        fullName: z.string().min(2, { message: t.min(fields.fullName, 2) }),
        gender: z.string().min(1, { message: t.required(fields.gender) }),
        classId: z.string().min(1, { message: t.required(fields.classId) }),
        baptismalName: z.string().optional().or(z.literal('')),
        mothersName: z.string().optional().or(z.literal('')),
        dateOfBirth: z.string().optional().or(z.literal('')),
        educationLevel: z.string().optional().or(z.literal('')),
        fathersPhoneNumber: z.string().regex(phoneRegex, { message: t.invalidNumber }).optional().or(z.literal('')),
        mothersPhoneNumber: z.string().regex(phoneRegex, { message: t.invalidNumber }).optional().or(z.literal('')),
        additionalPhoneNumber: z.string().regex(phoneRegex, { message: t.invalidNumber }).optional().or(z.literal('')),
        phoneNumber: z.string().regex(phoneRegex, { message: t.invalidNumber }).min(9, { message: t.min(fields.phone, 9) }),
        subcity: z.string().optional().or(z.literal('')),
        kebele: z.string().optional().or(z.literal('')),
        houseNumber: z.string().optional().or(z.literal('')),
        specificAddress: z.string().optional().or(z.literal('')),
        dateOfJoining: z.string().optional().or(z.literal('')),
    });
};
