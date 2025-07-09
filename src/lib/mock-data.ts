import type { z } from 'zod';
import type { getStudentRegistrationSchema } from '@/lib/validations/student';

export type Student = z.infer<ReturnType<typeof getStudentRegistrationSchema>>;

export type UserRole = 'super_admin' | 'children_admin' | 'children_2_admin' | 'junior_admin' | 'senior_admin';
export type ServiceDepartment = 'ቀዳማይ -1 ክፍል' | 'ቀዳማይ -2 ክፍል' | 'ካእላይ ክፍል' | 'ማእከላይ ክፍል';

export const roleToServiceDepartmentMap: Record<Exclude<UserRole, 'super_admin'>, ServiceDepartment> = {
  children_admin: 'ቀዳማይ -1 ክፍል',
  children_2_admin: 'ቀዳማይ -2 ክፍል',
  junior_admin: 'ካእላይ ክፍል',
  senior_admin: 'ማእከላይ ክፍል',
};

export const serviceDepartmentTransferMap: Partial<Record<ServiceDepartment, ServiceDepartment>> = {
  'ቀዳማይ -1 ክፍል': 'ቀዳማይ -2 ክፍል',
  'ቀዳማይ -2 ክፍል': 'ካእላይ ክፍል',
  'ካእላይ ክፍል': 'ማእከላይ ክፍል',
};

export interface User {
  username: string;
  password: string; 
  role: UserRole;
  displayName: string;
}

export const mockUsers: User[] = [
    { username: 'superadmin', password: 'password', role: 'super_admin', displayName: 'ዋና ኅላፊ' },
    { username: 'childrenadmin', password: 'password', role: 'children_admin', displayName: 'ቀዳማይ -1 ክፍል' },
    { username: 'children2admin', password: 'password', role: 'children_2_admin', displayName: 'ቀዳማይ -2 ክፍል' },
    { username: 'junioradmin', password: 'password', role: 'junior_admin', displayName: 'ካእላይ ክፍል' },
    { username: 'senioradmin', password: 'password', role: 'senior_admin', displayName: 'ማእከላይ ክፍል' },
];

export const mockStudents: Student[] = [
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S001',
    fullName: 'Abebe Bikila',
    gender: 'ወንድ',
    serviceDepartment: 'ቀዳማይ -1 ክፍል',
    baptismalName: 'Gebre Meskel',
    mothersName: 'Woizero Bekelech',
    dateOfBirth: '2012-03-15',
    educationLevel: '5ኛ-8ኛ ክፍል',
    fathersPhoneNumber: '0911123456',
    mothersPhoneNumber: '0911234567',
    additionalPhoneNumber: '',
    phoneNumber: '0911234567',
    subcity: 'Kirkos',
    kebele: '08',
    houseNumber: '123',
    specificAddress: 'Near St. George Church',
    dateOfJoining: new Date('2023-01-10'),
  },
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S005',
    fullName: 'Meseret Defar',
    gender: 'ሴት',
    serviceDepartment: 'ቀዳማይ -2 ክፍል',
    baptismalName: 'Kidus Yohannes',
    mothersName: 'Woizero Leteberhan',
    dateOfBirth: '2010-09-01',
    educationLevel: '5ኛ-8ኛ ክፍል',
    fathersPhoneNumber: '0931123456',
    mothersPhoneNumber: '0931234567',
    additionalPhoneNumber: '',
    phoneNumber: '0931234567',
    subcity: 'Yeka',
    kebele: '11',
    houseNumber: '222',
    specificAddress: 'Near Megenagna',
    dateOfJoining: new Date('2023-03-20'),
  },
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S002',
    fullName: 'Tirunesh Dibaba',
    gender: 'ሴት',
    serviceDepartment: 'ካእላይ ክፍል',
    baptismalName: 'Walatta Sellassie',
    mothersName: 'Woizero Desta',
    dateOfBirth: '2008-07-20',
    educationLevel: '9ኛ-10ኛ ክፍል',
    fathersPhoneNumber: '0912345678',
    mothersPhoneNumber: '0912456789',
    additionalPhoneNumber: '',
    phoneNumber: '0912345678',
    subcity: 'Bole',
    kebele: '03',
    houseNumber: '456',
    specificAddress: 'Around Edna Mall',
    dateOfJoining: new Date('2023-01-11'),
  },
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S003',
    fullName: 'Haile Gebrselassie',
    gender: 'ወንድ',
    serviceDepartment: 'ማእከላይ ክፍል',
    baptismalName: 'Fikre Mariam',
    mothersName: 'Woizero Ayelech',
    dateOfBirth: '2004-01-01',
    educationLevel: 'ዲግሪ',
    fathersPhoneNumber: '',
    mothersPhoneNumber: '0913123456',
    additionalPhoneNumber: '',
    phoneNumber: '0913456789',
    subcity: 'Arada',
    kebele: '10',
    houseNumber: '789',
    specificAddress: 'Piazza area',
    dateOfJoining: new Date('2023-01-12'),
  },
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S004',
    fullName: 'Kenenisa Bekele',
    gender: 'ወንድ',
    serviceDepartment: 'ቀዳማይ -1 ክፍል',
    baptismalName: 'Tekle Haymanot',
    mothersName: 'Woizero Almaz',
    dateOfBirth: '2013-05-10',
    educationLevel: '1ኛ-4ኛ ክፍል',
    fathersPhoneNumber: '0921123456',
    mothersPhoneNumber: '0921234567',
    additionalPhoneNumber: '',
    phoneNumber: '0921234567',
    subcity: 'Lideta',
    kebele: '05',
    houseNumber: '101',
    specificAddress: 'Near Lideta Church',
    dateOfJoining: new Date('2023-02-15'),
  },
];
