
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QRCodeSVG } from 'qrcode.react';
import { Student, Class } from '@prisma/client';
import { useLocale } from '@/contexts/locale-provider';
import { Printer, Download, Loader2, CreditCard, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface StudentIDCardDialogProps {
  student: (Student & { class: Class | null }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentIDCardDialog({ student, open, onOpenChange }: StudentIDCardDialogProps) {
  const { t } = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);
  const idCardFrontRef = useRef<HTMLDivElement>(null);
  const idCardBackRef = useRef<HTMLDivElement>(null);

  if (!student) {
    return null;
  }

  const schoolName = "የደብረ ገሊላ ዑማኑኤል ካቴድራል ሰ/ት/ቤት";
  const schoolAddress = "Addis Ababa, Ethiopia";
  const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // Get first available emergency contact
  const getEmergencyContact = () => {
    const contacts = [
      student.phoneNumber,
      student.additionalPhoneNumber,
      student.fathersPhoneNumber,
      student.mothersPhoneNumber,
    ];
    const firstValidContact = contacts.find((contact) => contact && contact.trim() !== '');
    return firstValidContact || 'No emergency contact available';
  };

  const emergencyContact = getEmergencyContact();

  // Bilingual label translations
  const labels = {
    fullName: 'Full Name (ሙሉ ስም)',
    registrationNumber: 'Registration No (የምዝገባ ቁጥር)',
    class: 'Class (ክፍል)',
    gender: 'Gender (ጾታ)',
    emergencyContact: 'Emergency Contact (የአደጋ ጊዜ ተጠሪ)',
    issueDate: 'Issue Date (የተሰጠበት ቀን)',
  };

  const handlePrint = async () => {
    try {
      window.print();
    } catch (err) {
      console.error('Print error:', err);
      setError('Failed to print ID card. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!idCardFrontRef.current || !idCardBackRef.current) {
      setError('Card elements not found. Please refresh and try again.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Wait longer for all images to load fully
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture both cards
      const canvasFront = await html2canvas(idCardFrontRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 5000,
      });
      
      const canvasBack = await html2canvas(idCardBackRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 5000,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 108],
      });

      // Add front side
      const imgDataFront = canvasFront.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgDataFront, 'JPEG', 0, 0, 85.6, 54);
      
      // Add back side
      pdf.addPage();
      const imgDataBack = canvasBack.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgDataBack, 'JPEG', 0, 0, 85.6, 54);

      pdf.save(`${student.fullName.replace(/\s+/g, '_')}_ID_Card.pdf`);
      
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again or use the Print button.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Student ID Card - {showBack ? 'Back' : 'Front'}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowBack(!showBack)}
              className="flex items-center gap-1"
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4" />
              {showBack ? 'Show Front' : 'Show Back'}
            </Button>
            <Button
              variant="secondary"
              onClick={handlePrint}
              disabled={isGenerating}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Both
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Download Both Sides'}
            </Button>
          </div>
        </DialogHeader>

        {error && (
          <div className="text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
            {error}
          </div>
        )}

        {/* Both cards always in DOM for capture - only one visible */}
        <div className="relative">
          {/* Front Side - Clean, Minimal Design */}
          <div className={`flex justify-center py-6 transition-opacity duration-300 ${showBack ? 'opacity-0 absolute left-0 right-0 top-0' : 'opacity-100'}`}>
            <div
              ref={idCardFrontRef}
              id="student-id-card-front"
              className="relative w-[340px] h-[216px] rounded-2xl overflow-hidden shadow-2xl border border-slate-100"
              style={{
                backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #e8f4fd 50%, #ffffff 100%)',
              }}
            >
              {/* Card Background Accents */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-400/8 rounded-full blur-2xl" />
                <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-blue-500/8 rounded-full blur-2xl" />
              </div>

              {/* Header Section - Logo and School Name */}
              <div className="relative px-5 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  {/* School Logo - Top Left */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden p-1">
                      <img
                        src="/image/logo.jpg"
                        alt="School Logo"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          display: 'block',
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* School Name Text */}
                  <div className="flex-1">
                    <h2 className="text-blue-800 font-bold text-[11px] leading-tight text-left">
                      {schoolName}
                    </h2>
                    <p className="text-blue-700 text-[9px] font-semibold uppercase tracking-wider mt-0.5 text-left">
                      የተማሪዎች መታወቂያ ካርድ
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content - Student Info */}
              <div className="relative px-5 py-2">
                <div className="flex gap-5">
                  {/* Left Column - Portrait Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-28 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                      <Avatar className="w-full h-full">
                        <AvatarImage 
                          src={student.photo || undefined} 
                          alt={student.fullName} 
                          className="object-cover w-full h-full" 
                        />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold">
                          {student.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Right Column - Information */}
                  <div className="flex-1 flex flex-col justify-center space-y-3">
                    {/* Full Name - Prominent */}
                    <div className="space-y-1">
                      <p className="text-[6px] text-slate-500 font-medium tracking-wide">{labels.fullName}</p>
                      <p className="text-[13px] font-bold text-slate-800 leading-tight">{student.fullName}</p>
                    </div>

                    {/* Registration Number - Highlighted */}
                    <div className="space-y-1">
                      <p className="text-[6px] text-slate-500 font-medium tracking-wide">{labels.registrationNumber}</p>
                      <p className="text-[14px] font-bold text-blue-700">{student.registrationNumber}</p>
                    </div>

                    {/* Class and Gender - Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-0.5">
                      <div className="space-y-0.5">
                        <p className="text-[6px] text-slate-500 font-medium tracking-wide">{labels.class}</p>
                        <p className="text-[11px] font-semibold text-slate-700">{student.class?.name || 'N/A'}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[6px] text-slate-500 font-medium tracking-wide">{labels.gender}</p>
                        <p className="text-[11px] font-semibold text-slate-700">{student.gender}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Accent Border */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700" />
            </div>
          </div>

          {/* Back Side - QR Code and Details */}
          <div className={`flex justify-center py-6 transition-opacity duration-300 ${!showBack ? 'opacity-0 absolute left-0 right-0 top-0' : 'opacity-100'}`}>
            <div
              ref={idCardBackRef}
              id="student-id-card-back"
              className="relative w-[340px] h-[216px] rounded-2xl overflow-hidden shadow-2xl border border-slate-100"
              style={{
                backgroundImage: 'linear-gradient(135deg, #e8f4fd 0%, #ffffff 50%, #e8f4fd 100%)',
              }}
            >
              {/* Card Background Accents */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />
              </div>

              {/* Top Section - School Info */}
              <div className="relative px-5 pt-4 pb-2">
                <div className="text-center">
                  <h2 className="text-blue-800 font-bold text-[10px] leading-tight">
                    {schoolName}
                  </h2>
                  <p className="text-blue-700 text-[8px] mt-1">
                    {schoolAddress}
                  </p>
                </div>
              </div>

              {/* Middle Section - QR Code */}
              <div className="relative px-5 py-2 flex justify-center">
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                  <QRCodeSVG
                    value={student.registrationNumber}
                    size={56}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* QR Code Label */}
              <div className="relative px-5 text-center">
                <p className="text-blue-700 text-[9px] font-semibold">
                  Scan for Student Verification
                </p>
              </div>

              {/* Bottom Section - Additional Details */}
              <div className="relative px-5 py-3">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div className="space-y-0.5">
                    <p className="text-[6px] text-slate-500 font-medium tracking-wide">{labels.issueDate}</p>
                    <p className="text-[10px] font-semibold text-slate-700">{issueDate}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[6px] text-slate-500 font-medium tracking-wide">{labels.emergencyContact}</p>
                    <p className="text-[10px] font-semibold text-slate-700">{emergencyContact}</p>
                  </div>
                </div>

                {/* Property Notice */}
                <div className="mt-4 pt-2 border-t border-blue-200">
                  <p className="text-center text-[7px] text-slate-500 font-medium">
                    Property of {schoolName}
                  </p>
                  <p className="text-center text-[6px] text-slate-400 mt-0.5">
                    If found, please return to school office
                  </p>
                </div>

                {/* Signature Area */}
                <div className="mt-3 flex justify-end">
                  <div className="text-right">
                    <div className="border-b border-blue-300 w-20 mb-0.5" />
                    <p className="text-[6px] text-slate-400">Authorized Signature</p>
                  </div>
                </div>
              </div>

              {/* Bottom Accent Border */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700" />
            </div>
          </div>
        </div>

        {/* Print styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #student-id-card-front, #student-id-card-front *,
            #student-id-card-back, #student-id-card-back * {
              visibility: visible !important;
            }
            #student-id-card-front, #student-id-card-back {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 85.6mm !important;
              height: 54mm !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
            #student-id-card-back {
              top: 54mm !important;
            }
            @page {
              size: 85.6mm 108mm;
              margin: 0;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
