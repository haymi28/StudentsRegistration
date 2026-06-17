
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Student, Class } from '@prisma/client';
import { useLocale } from '@/contexts/locale-provider';
import { format } from 'date-fns';
import { CreditCard } from 'lucide-react';
import { StudentIDCardDialog } from './student-id-card-dialog';

interface StudentDetailsDialogProps {
  student: (Student & { class: Class | null }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailsDialog({ student, open, onOpenChange }: StudentDetailsDialogProps) {
  const { t } = useLocale();
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);

  if (!student) {
    return null;
  }

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="font-medium text-muted-foreground">{label}</div>
      <div className="text-foreground">{value || t('common.na')}</div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle>{t('studentDetails.title')}</DialogTitle>
              <DialogDescription>
                {t('studentDetails.description', { name: student.fullName })}
              </DialogDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsIdCardOpen(true)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {t('idCard.button')}
            </Button>
          </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.photo || undefined} alt={student.fullName} />
              <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{student.fullName}</h2>
              <p className="text-muted-foreground">{student.registrationNumber}</p>
              <Badge variant="secondary" className="mt-2">{student.class?.name || t('common.na')}</Badge>
            </div>
          </div>
          
          <Separator />

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <h3 className="text-lg font-semibold col-span-full">{t('studentDetails.personalInfo')}</h3>
            <DetailItem label={t('studentDetails.label.fullName')} value={student.fullName} />
            <DetailItem label={t('studentDetails.label.baptismalName')} value={student.baptismalName} />
            <DetailItem label={t('studentDetails.label.mothersName')} value={student.mothersName} />
            <DetailItem label={t('studentDetails.label.gender')} value={student.gender === 'Male' ? t('form.gender.male') : t('form.gender.female')} />
            <DetailItem label={t('studentDetails.label.dob')} value={student.dateOfBirth} />
            <DetailItem label={t('studentDetails.label.education')} value={student.educationLevel} />
            <DetailItem label={t('studentDetails.label.joinDate')} value={student.dateOfJoining} />
            <DetailItem label={t('studentDetails.label.class')} value={student.class?.name} />
          </div>

          <Separator />
          
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <h3 className="text-lg font-semibold col-span-full">{t('studentDetails.contactInfo')}</h3>
            <DetailItem label={t('studentDetails.label.phone')} value={student.phoneNumber} />
            <DetailItem label={t('studentDetails.label.additionalPhone')} value={student.additionalPhoneNumber} />
            <DetailItem label={t('studentDetails.label.fathersPhone')} value={student.fathersPhoneNumber} />
            <DetailItem label={t('studentDetails.label.mothersPhone')} value={student.mothersPhoneNumber} />
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <h3 className="text-lg font-semibold col-span-full">{t('studentDetails.address')}</h3>
            <DetailItem label={t('studentDetails.label.subcity')} value={student.subcity} />
            <DetailItem label={t('studentDetails.label.kebele')} value={student.kebele} />
            <DetailItem label={t('studentDetails.label.houseNumber')} value={student.houseNumber} />
            <DetailItem label={t('studentDetails.label.specificAddress')} value={student.specificAddress} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <StudentIDCardDialog
      student={student}
      open={isIdCardOpen}
      onOpenChange={setIsIdCardOpen}
    />
    </>
  );
}
