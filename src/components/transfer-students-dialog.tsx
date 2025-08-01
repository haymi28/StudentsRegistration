
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Student } from '@prisma/client';
import { serviceDepartmentTransferMap, roleToServiceDepartmentMap, UserRole, ServiceDepartment } from '@/lib/constants';
import { useLocale } from '@/contexts/locale-provider';
import { updateStudent } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { generateTransferReport } from '@/lib/reporting';
import { useRouter } from 'next/navigation';

interface TransferStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudentIds: string[];
  students: Student[];
  currentUserRole: UserRole;
  onTransferSuccess: () => void;
}

export function TransferStudentsDialog({
  open,
  onOpenChange,
  selectedStudentIds,
  students,
  currentUserRole,
  onTransferSuccess,
}: TransferStudentsDialogProps) {
  const [targetServiceDepartment, setTargetServiceDepartment] = useState<ServiceDepartment | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocale();
  const { toast } = useToast();
  const router = useRouter();

  const selectedStudents = useMemo(
    () => students.filter(s => selectedStudentIds.includes(s.id)),
    [students, selectedStudentIds]
  );
  
  const fromServiceDepartment = useMemo(() => {
    if (currentUserRole === 'super_admin') {
      if (selectedStudents.length > 0) {
        const firstStudentDepartment = selectedStudents[0].serviceDepartment;
        if (selectedStudents.every(s => s.serviceDepartment === firstStudentDepartment)) {
          return firstStudentDepartment;
        }
      }
      return t('transfer.multipleDepartments');
    }
    return roleToServiceDepartmentMap[currentUserRole as Exclude<UserRole, 'super_admin'>];
  }, [currentUserRole, selectedStudents, t]);

  const transferOptions = useMemo<ServiceDepartment[]>(() => {
    if (fromServiceDepartment === t('transfer.multipleDepartments')) return [];
    const nextDepartment = serviceDepartmentTransferMap[fromServiceDepartment as ServiceDepartment];
    return nextDepartment ? [nextDepartment] : [];
  }, [fromServiceDepartment, t]);

  useEffect(() => {
    if (transferOptions.length === 1) {
      setTargetServiceDepartment(transferOptions[0]);
    } else {
      setTargetServiceDepartment('');
    }
  }, [transferOptions]);

  const handleTransfer = async () => {
    if (!targetServiceDepartment) return;
    setIsLoading(true);

    try {
        const transferPromises = selectedStudents.map(student => 
            updateStudent(student.id, { ...student, serviceDepartment: targetServiceDepartment })
        );
        await Promise.all(transferPromises);
        
        toast({
            title: t('transfer.successTitle'),
            description: t('transfer.successDescription').replace('{count}', String(selectedStudents.length)).replace('{to}', targetServiceDepartment),
        });

        const displayName = localStorage.getItem('displayName') || 'N/A';
        await generateTransferReport(
            selectedStudents,
            fromServiceDepartment,
            targetServiceDepartment,
            {
                title: t('report.title'),
                from: t('report.from'),
                to: t('report.to'),
                date: t('report.date'),
                generatedBy: t('report.generatedBy'),
                regNumber: t('report.regNumber'),
                fullName: t('report.fullName'),
                gender: t('report.gender'),
            },
            displayName
        );
        
        onTransferSuccess();
        router.refresh();
    } catch(error) {
        toast({
            variant: 'destructive',
            title: t('common.error'),
            description: error instanceof Error ? error.message : t('common.errorDescription'),
        });
    }


    setIsLoading(false);
    onOpenChange(false);
  };
  
  const canTransfer = transferOptions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('transfer.title')}</DialogTitle>
          <DialogDescription dangerouslySetInnerHTML={{ __html: t('transfer.description').replace('{count}', String(selectedStudentIds.length)).replace('{from}', `<strong>${fromServiceDepartment}</strong>`) }} />
        </DialogHeader>
        <div className="py-4 space-y-4">
            {canTransfer ? (
                <div>
                    <Label htmlFor="target-department">{t('transfer.toLabel')}</Label>
                    <Select
                        value={targetServiceDepartment}
                        onValueChange={(value) => setTargetServiceDepartment(value as ServiceDepartment)}
                    >
                        <SelectTrigger id="target-department">
                        <SelectValue placeholder={t('transfer.toPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                        {transferOptions.map((dep) => (
                            <SelectItem key={dep} value={dep}>
                            {dep}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md">
                    {fromServiceDepartment === t('transfer.multipleDepartments')
                        ? t('transfer.noOptionsMultiple')
                        : t('transfer.noOptionsHighest')
                    }
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t('transfer.cancel')}
          </Button>
          <Button onClick={handleTransfer} disabled={isLoading || !targetServiceDepartment || !canTransfer}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? t('transfer.loading') : t('transfer.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
