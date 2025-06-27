'use client';

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
import type { Student } from '@/lib/mock-data';
import { format } from 'date-fns';

interface StudentDetailsDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailsDialog({ student, open, onOpenChange }: StudentDetailsDialogProps) {
  if (!student) {
    return null;
  }

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="font-medium text-muted-foreground">{label}</div>
      <div className="text-foreground">{value || 'N/A'}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            Full information for {student.fullName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.photo} alt={student.fullName} />
              <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{student.fullName}</h2>
              <p className="text-muted-foreground">{student.registrationNumber}</p>
              <Badge variant="secondary" className="mt-2">{student.serviceDepartment}</Badge>
            </div>
          </div>
          
          <Separator />

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <h3 className="text-lg font-semibold col-span-full">Personal Information</h3>
            <DetailItem label="ሙሉ ስም" value={student.fullName} />
            <DetailItem label="የክርስትና ስም" value={student.baptismalName} />
            <DetailItem label="የእናት ስም" value={student.mothersName} />
            <DetailItem label="ጾታ" value={student.gender} />
            <DetailItem label="የትውልድ ቀን" value={student.dateOfBirth ? format(new Date(student.dateOfBirth), 'PPP') : 'N/A'} />
            <DetailItem label="የትምህርት ደረጃ" value={student.educationLevel} />
            <DetailItem label="የተመዘገቡበት ቀን" value={student.dateOfJoining ? format(new Date(student.dateOfJoining), 'PPP') : 'N/A'} />
          </div>

          <Separator />
          
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <h3 className="text-lg font-semibold col-span-full">Contact Information</h3>
            <DetailItem label="ስልክ ቁጥር" value={student.phoneNumber} />
            <DetailItem label="ተጨማሪ ስልክ" value={student.additionalPhoneNumber} />
            <DetailItem label="የአባት ስልክ ቁጥር" value={student.fathersPhoneNumber} />
            <DetailItem label="የእናት ስልክ ቁጥር" value={student.mothersPhoneNumber} />
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <h3 className="text-lg font-semibold col-span-full">Address</h3>
            <DetailItem label="ክፍለ ከተማ" value={student.subcity} />
            <DetailItem label="ቀበሌ" value={student.kebele} />
            <DetailItem label="የቤት ቁጥር" value={student.houseNumber} />
            <DetailItem label="የቤት ልዩ አድራሻ" value={student.specificAddress} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
