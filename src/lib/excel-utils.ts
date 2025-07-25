
'use client';

import * as XLSX from 'xlsx';
import type { Student } from './mock-data';
import type { TFunction } from '@/contexts/locale-provider';

// Note: The order of headers here is important and must match the template.
export const studentHeaders = (t: TFunction) => [
  { key: 'registrationNumber', label: t('form.label.regNumber') },
  { key: 'fullName', label: t('form.label.fullName') },
  { key: 'gender', label: t('form.label.gender') },
  { key: 'serviceDepartment', label: t('form.label.department') },
  { key: 'baptismalName', label: t('form.label.baptismalName') },
  { key: 'mothersName', label: t('form.label.mothersName') },
  { key: 'dateOfBirth', label: t('form.label.dob') },
  { key: 'educationLevel', label: t('form.label.education') },
  { key: 'phoneNumber', label: t('form.label.phone') },
  { key: 'additionalPhoneNumber', label: t('form.label.additionalPhone') },
  { key: 'fathersPhoneNumber', label: t('form.label.fathersPhone') },
  { key: 'mothersPhoneNumber', label: t('form.label.mothersPhone') },
  { key: 'subcity', label: t('form.label.subcity') },
  { key: 'kebele', label: t('form.label.kebele') },
  { key: 'houseNumber', label: t('form.label.houseNumber') },
  { key: 'specificAddress', label: t('form.label.specificAddress') },
  { key: 'dateOfJoining', label: t('form.label.joinDate') },
  { key: 'photo', label: t('form.photoLabel') },
];

export const exportToExcel = (students: Student[], fileName: string, t: TFunction) => {
  const headers = studentHeaders(t);
  const worksheetData = students.map(student => {
    const row: Record<string, any> = {};
    headers.forEach(header => {
      // For the photo, ensure we're getting the URL string.
      if (header.key === 'photo') {
        row[header.label] = student.photo || '';
      } else {
        row[header.label] = student[header.key as keyof Omit<Student, 'photo'>] || '';
      }
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  // Set column widths
  const colWidths = headers.map(header => ({ wch: Math.max(header.label.length, 20) }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, fileName);
};


export const readExcelFile = (file: File, t: TFunction): Promise<Student[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const headers = studentHeaders(t);
        const headerKeyMap = new Map(headers.map(h => [h.label, h.key]));

        const students: Student[] = jsonData.map(row => {
          const student: Partial<Student> = {};
          for (const key in row) {
            if (headerKeyMap.has(key)) {
              const studentKey = headerKeyMap.get(key) as keyof Student;
              // Ensure photo URL is handled correctly as a string
              student[studentKey] = row[key] !== null && row[key] !== undefined ? String(row[key]) : '';
            }
          }
          return student as Student;
        });

        resolve(students);
      } catch (err) {
        reject(new Error(t('import.errors.fileParseError')));
      }
    };
    reader.onerror = () => reject(new Error(t('import.errors.fileReadError')));
    reader.readAsBinaryString(file);
  });
};


export const downloadTemplate = (t: TFunction) => {
    const headers = studentHeaders(t).map(h => h.label);
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Set column widths
    const colWidths = headers.map(header => ({ wch: Math.max(header.length, 20) }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, 'student_import_template.xlsx');
};
