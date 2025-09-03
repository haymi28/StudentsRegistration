
import { z } from "zod";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);


export const getStudentRegistrationSchema = () => z.object({
  photo: z.string().optional(),
  registrationNumber: z.string().min(1, { message: 'Registration Number is required' }),
  fullName: z.string().min(2, { message: 'Full Name is required' }),
  gender: z.string({ required_error: 'Gender is required' }).min(1, { message: 'Gender is required' }),
  classId: z.string({ required_error: 'Class is required' }).min(1, { message: 'Class is required' }),
  baptismalName: z.string().optional(),
  mothersName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  educationLevel: z.string().optional(),
  fathersPhoneNumber: z.string().regex(phoneRegex, 'Invalid number').optional().or(z.literal('')),
  mothersPhoneNumber: z.string().regex(phoneRegex, 'Invalid number').optional().or(z.literal('')),
  additionalPhoneNumber: z.string().regex(phoneRegex, 'Invalid number').optional().or(z.literal('')),
  phoneNumber: z.string().regex(phoneRegex, 'Invalid number').min(9, { message: 'Phone number is required' }),
  subcity: z.string().optional(),
  kebele: z.string().optional(),
  houseNumber: z.string().optional(),
  specificAddress: z.string().optional(),
  dateOfJoining: z.string().optional(),
});
