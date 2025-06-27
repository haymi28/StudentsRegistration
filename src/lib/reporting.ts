'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Student, ServiceDepartment } from './mock-data';

export function generateTransferReport(
  students: Student[],
  fromDepartment: ServiceDepartment,
  toDepartment: ServiceDepartment
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Student Transfer Report`, 14, 22);
  doc.setFontSize(12);
  doc.text(`Transferred from: ${fromDepartment}`, 14, 30);
  doc.text(`Transferred to: ${toDepartment}`, 14, 36);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);

  const tableColumn = ["Reg. Number", "Full Name", "Gender", "Date of Birth"];
  const tableRows: (string | Date)[][] = [];

  students.forEach(student => {
    const studentData = [
      student.registrationNumber,
      student.fullName,
      student.gender,
      student.dateOfBirth.toLocaleDateString(),
    ];
    tableRows.push(studentData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 50,
  });

  doc.save(`transfer_report_${fromDepartment}_to_${toDepartment}_${new Date().toISOString().split('T')[0]}.pdf`);
}
