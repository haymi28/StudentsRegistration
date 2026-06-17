
'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/locale-provider';
import { Printer, Download, Loader2, CreditCard, RefreshCw } from 'lucide-react';
import {
  StudentIDCardFront,
  StudentIDCardBack,
  ID_CARD_PRINT_STYLES,
  getEmergencyContact,
  getIssueDate,
  type StudentWithClass,
} from './student-id-card-content';
import { generateSingleStudentIdCardPdf } from '@/lib/id-card-pdf';

interface StudentIDCardDialogProps {
  student: StudentWithClass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentIDCardDialog({ student, open, onOpenChange }: StudentIDCardDialogProps) {
  const { t, locale } = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);
  const idCardFrontRef = useRef<HTMLDivElement>(null);
  const idCardBackRef = useRef<HTMLDivElement>(null);

  if (!student) {
    return null;
  }

  const issueDate = getIssueDate(locale);
  const emergencyContact = getEmergencyContact(student, t);
  const cardProps = { student, t, locale, issueDate, emergencyContact };

  const handlePrint = async () => {
    try {
      window.print();
    } catch (err) {
      console.error('Print error:', err);
      setError(t('idCard.failedPrint'));
    }
  };

  const handleDownloadPDF = async () => {
    if (!idCardFrontRef.current || !idCardBackRef.current) {
      setError(t('idCard.elementsNotFound'));
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await generateSingleStudentIdCardPdf(
        idCardFrontRef.current,
        idCardBackRef.current,
        `${student.fullName.replace(/\s+/g, '_')}_ID_Card.pdf`
      );
    } catch (err) {
      console.error('PDF generation error:', err);
      setError(t('idCard.failedPDF'));
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
            {t('idCard.title')} - {showBack ? t('idCard.back') : t('idCard.front')}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowBack(!showBack)}
              className="flex items-center gap-1"
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4" />
              {showBack ? t('idCard.showFront') : t('idCard.showBack')}
            </Button>
            <Button variant="secondary" onClick={handlePrint} disabled={isGenerating}>
              <Printer className="mr-2 h-4 w-4" />
              {t('idCard.print')}
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? t('idCard.generating') : t('idCard.download')}
            </Button>
          </div>
        </DialogHeader>

        {error && (
          <div className="text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
            {error}
          </div>
        )}

        <div className="relative id-card-print-target">
          <div className={`flex justify-center py-6 transition-opacity duration-300 ${showBack ? 'opacity-0 absolute left-0 right-0 top-0' : 'opacity-100'}`}>
            <StudentIDCardFront ref={idCardFrontRef} {...cardProps} />
          </div>
          <div className={`flex justify-center py-6 transition-opacity duration-300 ${!showBack ? 'opacity-0 absolute left-0 right-0 top-0' : 'opacity-100'}`}>
            <StudentIDCardBack ref={idCardBackRef} {...cardProps} />
          </div>
        </div>

        <style>{ID_CARD_PRINT_STYLES}</style>
      </DialogContent>
    </Dialog>
  );
}
