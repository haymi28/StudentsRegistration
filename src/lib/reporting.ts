'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Student, ServiceDepartment } from './mock-data';

export interface ReportTranslations {
  title: string;
  from: string;
  to: string;
  date: string;
  generatedBy: string;
  regNumber: string;
  fullName: string;
  gender: string;
  dob: string;
}

const getEthiopianDate = (): string => {
    const now = new Date();
    let year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Ethiopian new year starts on September 11th (or 12th in a leap year)
    const ethiopianNewYearOffset = (year % 4 === 3) ? 12 : 11;
    
    let ethiopianYear = year - 8;
    if (month < 9 || (month === 9 && day < ethiopianNewYearOffset)) {
        ethiopianYear = year - 8;
    } else {
        ethiopianYear = year - 7;
    }
    
    // Simple approximation, for a more accurate conversion a dedicated library is needed.
    // This example will use a simplified placeholder as full conversion is complex.
    const amharicMonths = ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'];
    
    // Create a date object for the start of the Gregorian year
    const startOfYear = new Date(year, 0, 1);
    // Calculate the number of days passed since the start of the year
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    
    // Offset for Ethiopian New Year (Meskerem 1)
    let ethiopianDayOfYear = dayOfYear - 253; // Approx days from Jan 1 to Sep 11
    if (ethiopianDayOfYear < 0) {
        ethiopianDayOfYear += 365;
        if ((year-1) % 4 === 0) ethiopianDayOfYear++; // Leap year adjustment
    }

    const ethiopianMonthIndex = Math.floor((ethiopianDayOfYear -1) / 30);
    const ethiopianDay = ((ethiopianDayOfYear - 1) % 30) + 1;
    const ethiopianMonth = amharicMonths[ethiopianMonthIndex];

    return `${ethiopianDay} ${ethiopianMonth} ${ethiopianYear}`;
};


const formatDateForPdf = (date: string | undefined): string => {
  return date || 'N/A';
};

export async function generateTransferReport(
  students: Student[],
  fromDepartment: string,
  toDepartment: ServiceDepartment,
  translations: ReportTranslations,
  generatedByUsername: string
) {
  const reportElement = document.createElement('div');
  // Styling for the off-screen element that will be rendered to PDF
  reportElement.style.position = 'fixed';
  reportElement.style.left = '-9999px';
  reportElement.style.width = '210mm';
  reportElement.style.padding = '20mm';
  reportElement.style.boxSizing = 'border-box';
  reportElement.style.backgroundColor = 'white';
  reportElement.style.color = 'black';
  reportElement.style.fontFamily = '"Noto Sans Ethiopic", "PT Sans", sans-serif';

  const tableRows = students.map(student => `
    <tr>
      <td>${student.registrationNumber}</td>
      <td>${student.fullName}</td>
      <td>${student.gender}</td>
      <td>${formatDateForPdf(student.dateOfBirth)}</td>
    </tr>
  `).join('');

  const dateToday = getEthiopianDate();


  reportElement.innerHTML = `
    <style>
      body { margin: 0; }
      h1 { font-size: 18pt; margin-bottom: 10px; font-weight: bold; }
      p { font-size: 12pt; margin: 5px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10pt; }
      th, td { border: 1px solid #dddddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; font-weight: bold;}
    </style>
    <h1>${translations.title}</h1>
    <p><strong>${translations.from}</strong> ${fromDepartment}</p>
    <p><strong>${translations.to}</strong> ${toDepartment}</p>
    <p><strong>${translations.date}</strong> ${dateToday}</p>
    <p><strong>${translations.generatedBy}</strong> ${generatedByUsername}</p>
    <table>
      <thead>
        <tr>
          <th>${translations.regNumber}</th>
          <th>${translations.fullName}</th>
          <th>${translations.gender}</th>
          <th>${translations.dob}</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  document.body.appendChild(reportElement);

  try {
    const canvas = await html2canvas(reportElement, {
      scale: 2, // Improve resolution
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    const canvasPdfWidth = pdfWidth - 20;
    const canvasPdfHeight = canvasPdfWidth / ratio;

    let heightLeft = canvasPdfHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, canvasPdfWidth, canvasPdfHeight);
    heightLeft -= (pdfHeight - 20);

    while (heightLeft > 0) {
      position = -heightLeft + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, canvasPdfWidth, canvasPdfHeight);
      heightLeft -= (pdfHeight - 20);
    }
    
    pdf.save(`transfer_report_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
  } finally {
    document.body.removeChild(reportElement);
  }
}
