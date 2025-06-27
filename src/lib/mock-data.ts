import type { z } from 'zod';
import type { studentRegistrationSchema } from '@/lib/validations/student';

export type Student = z.infer<typeof studentRegistrationSchema>;

export type UserRole = 'super_admin' | 'children_admin' | 'children_2_admin' | 'junior_admin' | 'senior_admin';
export type ServiceDepartment = 'Children' | 'Children-2' | 'Junior' | 'Senior';

export const roleToServiceDepartmentMap: Record<Exclude<UserRole, 'super_admin'>, ServiceDepartment> = {
  children_admin: 'Children',
  children_2_admin: 'Children-2',
  junior_admin: 'Junior',
  senior_admin: 'Senior',
};

export const serviceDepartmentTransferMap: Partial<Record<ServiceDepartment, ServiceDepartment>> = {
  Children: 'Children-2',
  'Children-2': 'Junior',
  Junior: 'Senior',
};

export interface User {
  username: string;
  password: string; 
  role: UserRole;
}

export const mockUsers: User[] = [
    { username: 'superadmin', password: 'password', role: 'super_admin' },
    { username: 'childrenadmin', password: 'password', role: 'children_admin' },
    { username: 'children2admin', password: 'password', role: 'children_2_admin' },
    { username: 'junioradmin', password: 'password', role: 'junior_admin' },
    { username: 'senioradmin', password: 'password', role: 'senior_admin' },
];

export const mockStudents: Student[] = [
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S001',
    fullName: 'Abebe Bikila',
    gender: 'ወንድ',
    serviceDepartment: 'Children',
    baptismalName: 'Gebre Meskel',
    mothersName: 'Woizero Bekelech',
    dateOfBirth: new Date('2012-03-15'),
    educationLevel: '5ኛ-8ኛ ክፍል',
    fathersPhoneNumber: '0911123456',
    mothersPhoneNumber: '0911234567',
    additionalPhoneNumber: '',
    phoneNumber: '0911234567',
    subcity: 'Kirkos',
    kebele: '08',
    houseNumber: '123',
    specificAddress: 'Near St. George Church',
    formCompletionDate: new Date('2023-01-10'),
  },
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S005',
    fullName: 'Meseret Defar',
    gender: 'ሴት',
    serviceDepartment: 'Children-2',
    baptismalName: 'Kidus Yohannes',
    mothersName: 'Woizero Leteberhan',
    dateOfBirth: new Date('2010-09-01'),
    educationLevel: '5ኛ-8ኛ ክፍል',
    fathersPhoneNumber: '0931123456',
    mothersPhoneNumber: '0931234567',
    additionalPhoneNumber: '',
    phoneNumber: '0931234567',
    subcity: 'Yeka',
    kebele: '11',
    houseNumber: '222',
    specificAddress: 'Near Megenagna',
    formCompletionDate: new Date('2023-03-20'),
  },
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S002',
    fullName: 'Tirunesh Dibaba',
    gender: 'ሴት',
    serviceDepartment: 'Junior',
    baptismalName: 'Walatta Sellassie',
    mothersName: 'Woizero Desta',
    dateOfBirth: new Date('2008-07-20'),
    educationLevel: '9ኛ-10ኛ ክፍል',
    fathersPhoneNumber: '0912345678',
    mothersPhoneNumber: '0912456789',
    additionalPhoneNumber: '',
    phoneNumber: '0912345678',
    subcity: 'Bole',
    kebele: '03',
    houseNumber: '456',
    specificAddress: 'Around Edna Mall',
    formCompletionDate: new Date('2023-01-11'),
  },
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S003',
    fullName: 'Haile Gebrselassie',
    gender: 'ወንድ',
    serviceDepartment: 'Senior',
    baptismalName: 'Fikre Mariam',
    mothersName: 'Woizero Ayelech',
    dateOfBirth: new Date('2004-01-01'),
    educationLevel: 'ዲግሪ',
    fathersPhoneNumber: '',
    mothersPhoneNumber: '0913123456',
    additionalPhoneNumber: '',
    phoneNumber: '0913456789',
    subcity: 'Arada',
    kebele: '10',
    houseNumber: '789',
    specificAddress: 'Piazza area',
    formCompletionDate: new Date('2023-01-12'),
  },
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S004',
    fullName: 'Kenenisa Bekele',
    gender: 'ወንድ',
    serviceDepartment: 'Children',
    baptismalName: 'Tekle Haymanot',
    mothersName: 'Woizero Almaz',
    dateOfBirth: new Date('2013-05-10'),
    educationLevel: '1ኛ-4ኛ ክፍል',
    fathersPhoneNumber: '0921123456',
    mothersPhoneNumber: '0921234567',
    additionalPhoneNumber: '',
    phoneNumber: '0921234567',
    subcity: 'Lideta',
    kebele: '05',
    houseNumber: '101',
    specificAddress: 'Near Lideta Church',
    formCompletionDate: new Date('2023-02-15'),
  },
];
