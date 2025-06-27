import type { z } from 'zod';
import type { studentRegistrationSchema } from '@/lib/validations/student';

export type Student = z.infer<typeof studentRegistrationSchema>;

export type UserRole = 'super_admin' | 'children_admin' | 'junior_admin' | 'senior_admin';
export type StudentGroup = 'Children' | 'Junior' | 'Senior';

export const roleToGroupMap: Record<Exclude<UserRole, 'super_admin'>, StudentGroup> = {
  children_admin: 'Children',
  junior_admin: 'Junior',
  senior_admin: 'Senior',
};

export const groupTransferMap: Partial<Record<StudentGroup, StudentGroup>> = {
  Children: 'Junior',
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
    { username: 'junioradmin', password: 'password', role: 'junior_admin' },
    { username: 'senioradmin', password: 'password', role: 'senior_admin' },
];

export const mockStudents: Student[] = [
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S001',
    fullName: 'Abebe Bikila',
    gender: 'ወንድ',
    group: 'Children',
    serviceDepartment: 'Choir',
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
    registrationNumber: 'S002',
    fullName: 'Tirunesh Dibaba',
    gender: 'ሴት',
    group: 'Junior',
    serviceDepartment: 'Sunday School',
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
    group: 'Senior',
    serviceDepartment: 'Youth Association',
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
    group: 'Children',
    serviceDepartment: 'Altar Service',
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