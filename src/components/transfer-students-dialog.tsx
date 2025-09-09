
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
import { Class, Student } from '@prisma/client';
import { useLocale } from '@/contexts/locale-provider';
import { getClasses, transferStudentsToClass } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { generateTransferReport } from '@/lib/reporting';
import { useRouter } from 'next/navigation';

interface TransferStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudentIds: string[];
  students: (Student & { class: Class | null })[];
  onTransferSuccess: () => void;
}

export function TransferStudentsDialog({
  open,
  onOpenChange,
  selectedStudentIds,
  students,
  onTransferSuccess,
}: TransferStudentsDialogProps) {
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const { t } = useLocale();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      getClasses().then(setAllClasses);
    }
  }, [open]);

  const selectedStudents = useMemo(
    () => students.filter(s => selectedStudentIds.includes(s.id)),
    [students, selectedStudentIds]
  );
  
  const fromClass = useMemo(() => {
    if (selectedStudents.length > 0) {
      const firstStudentClass = selectedStudents[0].class;
      if (firstStudentClass && selectedStudents.every(s => s.classId === firstStudentClass?.id)) {
        return firstStudentClass;
      }
    }
    return null; // Indicates multiple or no single source class
  }, [selectedStudents]);

  const transferOptions = useMemo(() => {
    if (!fromClass) return [];
    return allClasses.filter(c => c.id !== fromClass.id);
  }, [allClasses, fromClass]);


  const handleTransfer = async () => {
    if (!targetClassId || !fromClass) return;
    setIsLoading(true);

    try {
        await transferStudentsToClass(selectedStudentIds, targetClassId);
        
        const targetClass = allClasses.find(c => c.id === targetClassId);

        toast({
            title: t('transfer.successTitle'),
            description: t('transfer.successDescription').replace('{count}', String(selectedStudents.length)).replace('{to}', targetClass?.name || ''),
        });

        const displayName = localStorage.getItem('displayName') || 'N/A';
        if (targetClass) {
          await generateTransferReport(
              selectedStudents,
              fromClass.name,
              targetClass.name,
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
        }
        
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
  
  const canTransfer = !!fromClass;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('transfer.title')}</DialogTitle>
           <DialogDescription dangerouslySetInnerHTML={{ __html: t('transfer.description').replace('{count}', String(selectedStudentIds.length)).replace('{from}', `<strong>${fromClass?.name || t('transfer.multipleClasses')}</strong>`) }} />
        </DialogHeader>
        <div className="py-4 space-y-4">
            {canTransfer ? (
                <div>
                    <Label htmlFor="target-class">{t('transfer.toLabel')}</Label>
                    <Select
                        value={targetClassId}
                        onValueChange={setTargetClassId}
                    >
                        <SelectTrigger id="target-class">
                        <SelectValue placeholder={t('transfer.toPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                        {transferOptions.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                            {c.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md">
                    {t('transfer.noOptionsMultiple')}
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t('transfer.cancel')}
          </Button>
          <Button onClick={handleTransfer} disabled={isLoading || !targetClassId || !canTransfer}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? t('transfer.loading') : t('transfer.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    