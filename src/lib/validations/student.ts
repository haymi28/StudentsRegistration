import { z } from "zod";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

export const studentRegistrationSchema = z.object({
  photo: z.string().optional(),
  registrationNumber: z.string().min(1, { message: "ቁጥር is required." }),
  fullName: z.string().min(2, { message: "ሙሉ ስም is required." }),
  gender: z.string({ required_error: "ጾታ is required." }).min(1, { message: "ጾታ is required." }),
  serviceDepartment: z.string().optional(),
  baptismalName: z.string().min(2, { message: "የክርስትና ስም is required." }),
  mothersName: z.string().min(2, { message: "የእናት ስም is required." }),
  dateOfBirth: z.date({
    required_error: "የትውልድ ቀን is required.",
  }),
  educationLevel: z.string({ required_error: "የትምህርት ደረጃ is required." }).min(1, { message: "የትምህርት ደረጃ is required." }),
  fathersPhoneNumber: z.string().regex(phoneRegex, 'Invalid number').optional().or(z.literal('')),
  mothersPhoneNumber: z.string().regex(phoneRegex, 'Invalid number').optional().or(z.literal('')),
  additionalPhoneNumber: z.string().regex(phoneRegex, 'Invalid number').optional().or(z.literal('')),
  phoneNumber: z.string().regex(phoneRegex, 'Invalid number').min(9, { message: "ስልክ ቁጥር is required." }),
  subcity: z.string().min(1, { message: "ክፍለ ከተማ is required." }),
  kebele: z.string().min(1, { message: "ቀበሌ is required." }),
  houseNumber: z.string().min(1, { message: "የቤት ቁጥር is required." }),
  specificAddress: z.string().min(5, { message: "የቤት ልዩ አድራሻ is required." }),
  formCompletionDate: z.date({
    required_error: "ቅፁ የተሞላበት ቀን is required.",
  }),
});
