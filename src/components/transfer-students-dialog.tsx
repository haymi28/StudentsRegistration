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
import type { Student, UserRole, StudentGroup } from '@/lib/mock-data';
import { groupTransferMap, roleToGroupMap } from '@/lib/mock-data';

interface TransferStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudentIds: string[];
  students: Student[];
  currentUserRole: UserRole;
  onTransferSuccess: (transferredStudentIds: string[], toGroup: StudentGroup) => void;
}

export function TransferStudentsDialog({
  open,
  onOpenChange,
  selectedStudentIds,
  students,
  currentUserRole,
  onTransferSuccess,
}: TransferStudentsDialogProps) {
  const [targetGroup, setTargetGroup] = useState<StudentGroup | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedStudents = useMemo(
    () => students.filter(s => selectedStudentIds.includes(s.registrationNumber)),
    [students, selectedStudentIds]
  );
  
  const fromGroup = useMemo(() => {
    if (currentUserRole === 'super_admin') {
      if (selectedStudents.length > 0) {
        const firstStudentGroup = selectedStudents[0].group;
        if (selectedStudents.every(s => s.group === firstStudentGroup)) {
          return firstStudentGroup;
        }
      }
      return 'Multiple';
    }
    return roleToGroupMap[currentUserRole as Exclude<UserRole, 'super_admin'>];
  }, [currentUserRole, selectedStudents]);

  const transferOptions = useMemo<StudentGroup[]>(() => {
    if (fromGroup === 'Multiple') return [];
    const nextGroup = groupTransferMap[fromGroup as StudentGroup];
    return nextGroup ? [nextGroup] : [];
  }, [fromGroup]);

  useEffect(() => {
    if (transferOptions.length === 1) {
      setTargetGroup(transferOptions[0]);
    } else {
      setTargetGroup('');
    }
  }, [transferOptions]);

  const handleTransfer = async () => {
    if (!targetGroup) return;
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    onTransferSuccess(selectedStudentIds, targetGroup);

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
            You are about to transfer {selectedStudentIds.length} student(s) from the <strong>{fromGroup}</strong> group.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {canTransfer ? (
                <div>
                    <Label htmlFor="target-group">Transfer To</Label>
                    <Select
                        value={targetGroup}
                        onValueChange={(value) => setTargetGroup(value as StudentGroup)}
                    >
                        <SelectTrigger id="target-group">
                        <SelectValue placeholder="Select target group" />
                        </SelectTrigger>
                        <SelectContent>
                        {transferOptions.map((group) => (
                            <SelectItem key={group} value={group}>
                            {group}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md">
                    {fromGroup === 'Multiple'
                        ? 'Cannot transfer students from multiple groups at once. Please select students from the same group.'
                        : 'These students are in the highest group and cannot be transferred further.'
                    }
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={isLoading || !targetGroup || !canTransfer}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
