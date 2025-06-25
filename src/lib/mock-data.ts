import type { z } from 'zod';
import type { studentRegistrationSchema } from '@/lib/validations/student';

export type Student = z.infer<typeof studentRegistrationSchema>;

export const mockStudents: Student[] = [
  {
    photo: 'https://placehold.co/100x100.png',
    registrationNumber: 'S001',
    fullName: 'Abebe Bikila',
    gender: 'ወንድ',
    serviceDepartment: 'Choir',
    baptismalName: 'Gebre Meskel',
    mothersName: 'Woizero Bekelech',
    dateOfBirth: new Date('1995-03-15'),
    educationLevel: 'ዲግሪ',
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
    serviceDepartment: 'Sunday School',
    baptismalName: 'Walatta Sellassie',
    mothersName: 'Woizero Desta',
    dateOfBirth: new Date('1998-07-20'),
    educationLevel: 'ማስተርስ',
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
    serviceDepartment: 'Youth Association',
    baptismalName: 'Fikre Mariam',
    mothersName: 'Woizero Ayelech',
    dateOfBirth: new Date('1992-01-01'),
    educationLevel: '11ኛ-12ኛ ክፍል',
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
];

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: Date;
  status: 'present' | 'absent';
  timeIn: string | null;
  timeOut: string | null;
}

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att1',
    studentId: 'S001',
    date: new Date(new Date().setDate(new Date().getDate())),
    status: 'present',
    timeIn: '09:05',
    timeOut: '16:00',
  },
  {
    id: 'att2',
    studentId: 'S002',
    date: new Date(new Date().setDate(new Date().getDate())),
    status: 'present',
    timeIn: '09:00',
    timeOut: '16:05',
  },
  {
    id: 'att3',
    studentId: 'S003',
    date: new Date(new Date().setDate(new Date().getDate())),
    status: 'absent',
    timeIn: null,
    timeOut: null,
  },
  {
    id: 'att4',
    studentId: 'S001',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    status: 'present',
    timeIn: '09:02',
    timeOut: '15:55',
  },
  {
    id: 'att5',
    studentId: 'S002',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    status: 'absent',
    timeIn: null,
    timeOut: null,
  },
  {
    id: 'att6',
    studentId: 'S003',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    status: 'present',
    timeIn: '09:15',
    timeOut: '16:10',
  },
];
