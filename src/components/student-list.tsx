'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockStudents, Student, UserRole, roleToServiceDepartmentMap, ServiceDepartment, serviceDepartmentTransferMap } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft } from 'lucide-react';
import { TransferStudentsDialog } from './transfer-students-dialog';
import { generateTransferReport } from '@/lib/reporting';
import { useToast } from '@/hooks/use-toast';

export function StudentList() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const role = localStorage.getItem('user_role') as UserRole;
    setUserRole(role);
  }, []);

  const displayedStudents = useMemo(() => {
    if (!userRole) return [];
    if (userRole === 'super_admin') return students;
    
    const userServiceDepartment = roleToServiceDepartmentMap[userRole as Exclude<UserRole, 'super_admin'>];
    return students.filter(s => s.serviceDepartment === userServiceDepartment);
  }, [students, userRole]);

  const isAllRowsSelected = selectedRowKeys.size > 0 && selectedRowKeys.size === displayedStudents.length;
  const isSomeRowsSelected = selectedRowKeys.size > 0 && !isAllRowsSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(new Set(displayedStudents.map(s => s.registrationNumber)));
    } else {
      setSelectedRowKeys(new Set());
    }
  };

  const handleRowSelect = (rowKey: string, checked: boolean) => {
    const newSelection = new Set(selectedRowKeys);
    if (checked) {
      newSelection.add(rowKey);
    } else {
      newSelection.delete(rowKey);
    }
    setSelectedRowKeys(newSelection);
  };

  const handleTransferSuccess = (transferredStudentIds: string[], toServiceDepartment: ServiceDepartment) => {
    const transferredStudents: Student[] = [];
    const updatedStudents = students.map(student => {
      if (transferredStudentIds.includes(student.registrationNumber)) {
        const updatedStudent = { ...student, serviceDepartment: toServiceDepartment };
        transferredStudents.push(updatedStudent);
        return updatedStudent;
      }
      return student;
    });

    setStudents(updatedStudents);
    setSelectedRowKeys(new Set());
    
    if (transferredStudents.length > 0) {
      const fromServiceDepartment = roleToServiceDepartmentMap[userRole as Exclude<UserRole, 'super_admin'>] || 'multiple departments';
      generateTransferReport(transferredStudents, fromServiceDepartment, toServiceDepartment);
      toast({
        title: 'Transfer Successful',
        description: `${transferredStudents.length} student(s) transferred to ${toServiceDepartment}.`,
      });
    }
  };

  const fromServiceDepartment = userRole && userRole !== 'super_admin' ? roleToServiceDepartmentMap[userRole] : undefined;
  const canTransfer = fromServiceDepartment && !!serviceDepartmentTransferMap[fromServiceDepartment];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Registered Students</CardTitle>
                <CardDescription>
                {userRole === 'super_admin' 
                    ? 'A list of all students in the system.' 
                    : `A list of all students in the ${fromServiceDepartment} department.`}
                </CardDescription>
            </div>
            {selectedRowKeys.size > 0 && (userRole !== 'super_admin' ? canTransfer : true) && (
                <Button onClick={() => setIsDialogOpen(true)}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Transfer ({selectedRowKeys.size})
                </Button>
            )}
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                        checked={isAllRowsSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-[80px]">Photo</TableHead>
                  <TableHead className="w-[150px]">Reg. Number</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>የአገልግሎት ክፍል</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead className="text-right">Education Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedStudents.map((student) => (
                  <TableRow key={student.registrationNumber} data-state={selectedRowKeys.has(student.registrationNumber) && "selected"}>
                    <TableCell>
                        <Checkbox
                            checked={selectedRowKeys.has(student.registrationNumber)}
                            onCheckedChange={(checked) => handleRowSelect(student.registrationNumber, !!checked)}
                            aria-label={`Select row ${student.registrationNumber}`}
                        />
                    </TableCell>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={student.photo} alt={student.fullName} data-ai-hint="student portrait" />
                        <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{student.registrationNumber}</TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.serviceDepartment}</Badge>
                    </TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{student.educationLevel}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {userRole && 
        <TransferStudentsDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            selectedStudentIds={Array.from(selectedRowKeys)}
            students={students}
            currentUserRole={userRole}
            onTransferSuccess={handleTransferSuccess}
        />
      }
    </>
  );
}
