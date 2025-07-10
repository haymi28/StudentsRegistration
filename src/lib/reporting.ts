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
}

const getEthiopianDate = (): string => {
    const now = new Date();
    let year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const isGregorianLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const ethiopianNewYearDayInSeptember = isGregorianLeap ? 12 : 11;
    
    let ethiopianYear = year - 8;
    if (month < 9 || (month === 9 && day < ethiopianNewYearDayInSeptember)) {
        ethiopianYear = year - 8;
    } else {
        ethiopianYear = year - 7;
    }
    
    const amharicMonths = ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'];
    
    const startOfGregorianYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfGregorianYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    let ethioDayOfYear;
    const dayOfEthioNewYear = isGregorianLeap ? 255 : 254;

    if (dayOfYear > dayOfEthioNewYear) {
      ethioDayOfYear = dayOfYear - dayOfEthioNewYear;
    } else {
      const prevGregorianYearIsLeap = ((year - 1) % 4 === 0 && (year - 1) % 100 !== 0) || (year - 1) % 400 === 0;
      ethioDayOfYear = dayOfYear + (prevGregorianYearIsLeap ? 112 : 111);
    }
    
    let ethiopianMonthIndex = Math.floor((ethioDayOfYear - 1) / 30);
    let ethiopianDay = ((ethioDayOfYear - 1) % 30) + 1;

    // Pagume has 5 or 6 days
    if (ethiopianMonthIndex === 12) {
      const isEthiopianLeap = (ethiopianYear + 1) % 4 === 0;
      if (ethiopianDay > (isEthiopianLeap ? 6 : 5) ) {
        ethiopianDay = 1;
        ethiopianMonthIndex = 0; // Back to Meskerem
      }
    }
    
    const ethiopianMonth = amharicMonths[ethiopianMonthIndex];

    return `${ethiopianDay} ${ethiopianMonth} ${ethiopianYear}`;
};

export async function generateTransferReport(
  students: Student[],
  fromDepartment: string,
  toDepartment: ServiceDepartment,
  translations: ReportTranslations,
  generatedByDisplayName: string
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
    <p><strong>${translations.generatedBy}</strong> ${generatedByDisplayName}</p>
    <table>
      <thead>
        <tr>
          <th>${translations.regNumber}</th>
          <th>${translations.fullName}</th>
          <th>${translations.gender}</th>
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
