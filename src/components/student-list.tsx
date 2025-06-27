'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
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
import { ArrowRightLeft, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { TransferStudentsDialog } from './transfer-students-dialog';
import { StudentDetailsDialog } from './student-details-dialog';
import { generateTransferReport } from '@/lib/reporting';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const role = localStorage.getItem('user_role') as UserRole;
    setUserRole(role);
    setStudents([...mockStudents]);
  }, []);

  const filteredStudents = useMemo(() => {
    let studentsToDisplay = students;

    if (userRole && userRole !== 'super_admin') {
      const userServiceDepartment = roleToServiceDepartmentMap[userRole as Exclude<UserRole, 'super_admin'>];
      studentsToDisplay = students.filter(s => s.serviceDepartment === userServiceDepartment);
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      studentsToDisplay = studentsToDisplay.filter(student =>
        student.fullName.toLowerCase().includes(lowercasedQuery) ||
        student.registrationNumber.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    return studentsToDisplay;
  }, [students, userRole, searchQuery]);

  const isAllRowsSelected = selectedRowKeys.size > 0 && selectedRowKeys.size === filteredStudents.length && filteredStudents.length > 0;
  const isSomeRowsSelected = selectedRowKeys.size > 0 && !isAllRowsSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(new Set(filteredStudents.map(s => s.registrationNumber)));
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

    // Update mockStudents (the source of truth)
    mockStudents.forEach(student => {
      if (transferredStudentIds.includes(student.registrationNumber)) {
        student.serviceDepartment = toServiceDepartment;
      }
    });
    
    // Update local state for immediate UI refresh
    const updatedStudents = students.map(student => {
      if (transferredStudentIds.includes(student.registrationNumber)) {
        const updatedStudent = { ...student, serviceDepartment: toServiceDepartment };
        transferredStudents.push(updatedStudent); // Collect for report
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

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsDialogOpen(true);
  };
  
  const handleDeleteStudent = () => {
    if (!studentToDelete) return;

    const studentIndex = mockStudents.findIndex(s => s.registrationNumber === studentToDelete.registrationNumber);
    if (studentIndex > -1) {
      mockStudents.splice(studentIndex, 1);
    }

    setStudents(prev => prev.filter(s => s.registrationNumber !== studentToDelete.registrationNumber));
    
    toast({
      variant: "destructive",
      title: "Student Deleted",
      description: `Student ${studentToDelete.fullName} has been removed.`,
    });
    setStudentToDelete(null);
  };


  const fromServiceDepartment = userRole && userRole !== 'super_admin' ? roleToServiceDepartmentMap[userRole] : undefined;
  const canTransfer = fromServiceDepartment && !!serviceDepartmentTransferMap[fromServiceDepartment];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-grow">
            <CardTitle>Registered Students</CardTitle>
            <CardDescription>
              {userRole === 'super_admin' 
                ? 'A list of all students in the system.' 
                : `A list of all students in the ${fromServiceDepartment} department.`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            {selectedRowKeys.size > 0 && (userRole !== 'super_admin' ? canTransfer : true) && (
              <Button onClick={() => setIsTransferDialogOpen(true)} className="shrink-0">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transfer ({selectedRowKeys.size})
              </Button>
            )}
          </div>
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
                      disabled={filteredStudents.length === 0}
                    />
                  </TableHead>
                  <TableHead className="w-[80px]">Photo</TableHead>
                  <TableHead>Reg. Number</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>የአገልግሎት ክፍል</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
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
                      <TableCell>{student.phoneNumber}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button asChild variant="ghost" size="icon">
                            <Link href={`/students/edit/${student.registrationNumber}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit Student</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(student)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => setStudentToDelete(student)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete Student</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {userRole && 
        <TransferStudentsDialog
            open={isTransferDialogOpen}
            onOpenChange={setIsTransferDialogOpen}
            selectedStudentIds={Array.from(selectedRowKeys)}
            students={students}
            currentUserRole={userRole}
            onTransferSuccess={handleTransferSuccess}
        />
      }

      <StudentDetailsDialog 
        student={selectedStudent}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
      
      <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the record for <strong>{studentToDelete?.fullName}</strong>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setStudentToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={handleDeleteStudent}
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
