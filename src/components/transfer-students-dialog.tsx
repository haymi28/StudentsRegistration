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
import type { Student, UserRole, ServiceDepartment } from '@/lib/mock-data';
import { serviceDepartmentTransferMap, roleToServiceDepartmentMap } from '@/lib/mock-data';

interface TransferStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudentIds: string[];
  students: Student[];
  currentUserRole: UserRole;
  onTransferSuccess: (transferredStudentIds: string[], toServiceDepartment: ServiceDepartment) => void;
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

  const selectedStudents = useMemo(
    () => students.filter(s => selectedStudentIds.includes(s.registrationNumber)),
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
      return 'Multiple';
    }
    return roleToServiceDepartmentMap[currentUserRole as Exclude<UserRole, 'super_admin'>];
  }, [currentUserRole, selectedStudents]);

  const transferOptions = useMemo<ServiceDepartment[]>(() => {
    if (fromServiceDepartment === 'Multiple') return [];
    const nextDepartment = serviceDepartmentTransferMap[fromServiceDepartment as ServiceDepartment];
    return nextDepartment ? [nextDepartment] : [];
  }, [fromServiceDepartment]);

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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    onTransferSuccess(selectedStudentIds, targetServiceDepartment);

    setIsLoading(false);
    onOpenChange(false);
  };
  
  const canTransfer = transferOptions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Students</DialogTitle>
          <DialogDescription>
            You are about to transfer {selectedStudentIds.length} student(s) from the <strong>{fromServiceDepartment}</strong> department.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {canTransfer ? (
                <div>
                    <Label htmlFor="target-department">Transfer To</Label>
                    <Select
                        value={targetServiceDepartment}
                        onValueChange={(value) => setTargetServiceDepartment(value as ServiceDepartment)}
                    >
                        <SelectTrigger id="target-department">
                        <SelectValue placeholder="Select target department" />
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
                    {fromServiceDepartment === 'Multiple'
                        ? 'Cannot transfer students from multiple departments at once. Please select students from the same department.'
                        : 'These students are in the highest department and cannot be transferred further.'
                    }
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={isLoading || !targetServiceDepartment || !canTransfer}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
