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
    
    const fields = {
        regNumber: 'Registration Number',
        fullName: 'Full Name',
        gender: 'Gender',
        department: 'Department',
        phone: 'Phone Number'
    };

    return z.object({
        photo: z.string().optional(),
        registrationNumber: z.string({ required_error: t.required(fields.regNumber) }).min(1, { message: t.required(fields.regNumber) }),
        fullName: z.string({ required_error: t.required(fields.fullName) }).min(2, { message: t.min(fields.fullName, 2) }),
        gender: z.string({ required_error: t.required(fields.gender) }).min(1, { message: t.required(fields.gender) }),
        classId: z.string({ required_error: t.required(fields.department) }).min(1, { message: t.required(fields.department) }),
        baptismalName: z.string().optional(),
        mothersName: z.string().optional(),
        dateOfBirth: z.string().optional(),
        educationLevel: z.string().optional(),
        fathersPhoneNumber: z.string().regex(phoneRegex, t.invalidNumber).optional().or(z.literal('')),
        mothersPhoneNumber: z.string().regex(phoneRegex, t.invalidNumber).optional().or(z.literal('')),
        additionalPhoneNumber: z.string().regex(phoneRegex, t.invalidNumber).optional().or(z.literal('')),
        phoneNumber: z.string({ required_error: t.required(fields.phone) }).regex(phoneRegex, t.invalidNumber).min(9, { message: t.required(fields.phone) }),
        subcity: z.string().optional(),
        kebele: z.string().optional(),
        houseNumber: z.string().optional(),
        specificAddress: z.string().optional(),
        dateOfJoining: z.string().optional(),
    });
};
