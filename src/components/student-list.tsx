'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockStudents, Student, UserRole, roleToServiceDepartmentMap, ServiceDepartment, serviceDepartmentTransferMap, mockUsers } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Search, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useLocale } from '@/contexts/locale-provider';

const STUDENTS_PER_PAGE = 10;

export function StudentList() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userDisplayName, setUserDisplayName] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { t } = useLocale();

  useEffect(() => {
    const role = localStorage.getItem('user_role') as UserRole;
    const username = localStorage.getItem('username');
    setUserRole(role);

    if (username) {
      const users = JSON.parse(localStorage.getItem('users') || 'null') || mockUsers;
      const currentUser = users.find((u: { username: string; }) => u.username === username);
      if (currentUser) {
        setUserDisplayName(currentUser.displayName);
      } else {
        setUserDisplayName(username);
      }
    }

    // Function to load students from localStorage or mock data
    const loadStudents = () => {
      const storedStudents = localStorage.getItem('students');
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      } else {
        setStudents([...mockStudents]);
      }
    };

    loadStudents();

    // Listen for storage changes to update the list
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'students') {
        loadStudents();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
  
  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
    const endIndex = startIndex + STUDENTS_PER_PAGE;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const currentPageStudentIds = useMemo(() => new Set(paginatedStudents.map(s => s.registrationNumber)), [paginatedStudents]);
  const selectedOnCurrentPage = new Set([...selectedRowKeys].filter(id => currentPageStudentIds.has(id)));

  const isAllOnPageSelected = paginatedStudents.length > 0 && selectedOnCurrentPage.size === paginatedStudents.length;

  const handleSelectAllOnPage = (checked: boolean) => {
    const newSelection = new Set(selectedRowKeys);
    if (checked) {
      paginatedStudents.forEach(student => newSelection.add(student.registrationNumber));
    } else {
      paginatedStudents.forEach(student => newSelection.delete(student.registrationNumber));
    }
    setSelectedRowKeys(newSelection);
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

  const handleTransferSuccess = (transferredStudentIds: string[], toServiceDepartment: ServiceDepartment, fromServiceDepartment: string) => {
    const transferredStudents: Student[] = [];

    const updatedStudents = students.map(student => {
      if (transferredStudentIds.includes(student.registrationNumber)) {
        const updatedStudent = { ...student, serviceDepartment: toServiceDepartment };
        transferredStudents.push(updatedStudent);
        return updatedStudent;
      }
      return student;
    });

    localStorage.setItem('students', JSON.stringify(updatedStudents));
    window.dispatchEvent(new Event('storage'));
    setSelectedRowKeys(new Set());
    
    if (transferredStudents.length > 0) {
       const reportTranslations = {
        title: t('pdf.transfer.title'),
        from: t('pdf.transfer.from'),
        to: t('pdf.transfer.to'),
        date: t('pdf.transfer.date'),
        generatedBy: t('pdf.transfer.generatedBy'),
        regNumber: t('pdf.transfer.regNumber'),
        fullName: t('pdf.transfer.fullName'),
        gender: t('pdf.transfer.gender'),
      };
      generateTransferReport(transferredStudents, fromServiceDepartment, toServiceDepartment, reportTranslations, userDisplayName);
      toast({
        title: t('transfer.success'),
        description: t('transfer.successDescription').replace('{count}', String(transferredStudents.length)).replace('{department}', toServiceDepartment),
      });
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsDialogOpen(true);
  };
  
  const handleDeleteStudent = () => {
    if (!studentToDelete) return;

    const updatedStudents = students.filter(s => s.registrationNumber !== studentToDelete.registrationNumber);
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    window.dispatchEvent(new Event('storage'));
    
    toast({
      variant: "destructive",
      title: t('students.deleteSuccess'),
      description: t('students.deleteSuccessDescription').replace('{name}', studentToDelete.fullName),
    });
    setStudentToDelete(null);
  };


  const fromServiceDepartment = userRole && userRole !== 'super_admin' ? roleToServiceDepartmentMap[userRole] : undefined;
  const canTransfer = fromServiceDepartment && !!serviceDepartmentTransferMap[fromServiceDepartment];
  
  const PaginationControls = () => (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        {t('pagination.previous')}
      </Button>
      <span className="text-sm text-muted-foreground">
        {t('pagination.page').replace('{currentPage}', String(currentPage)).replace('{totalPages}', String(totalPages))}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        {t('pagination.next')}
      </Button>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-grow">
            <CardTitle>{t('students.title')}</CardTitle>
            <CardDescription>
              {userRole === 'super_admin' 
                ? t('students.descriptionSuperAdmin')
                : t('students.descriptionAdmin').replace('{department}', fromServiceDepartment || '')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('students.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            {selectedRowKeys.size > 0 && (userRole !== 'super_admin' ? canTransfer : true) && (
              <Button onClick={() => setIsTransferDialogOpen(true)} className="shrink-0">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                {t('students.transferButton').replace('{count}', String(selectedRowKeys.size))}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="border rounded-lg overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllOnPageSelected}
                      onCheckedChange={(checked) => handleSelectAllOnPage(!!checked)}
                      aria-label="Select all on this page"
                      disabled={paginatedStudents.length === 0}
                    />
                  </TableHead>
                  <TableHead className="w-[80px]">{t('students.table.photo')}</TableHead>
                  <TableHead>{t('students.table.regNumber')}</TableHead>
                  <TableHead>{t('students.table.fullName')}</TableHead>
                  <TableHead>{t('students.table.department')}</TableHead>
                  <TableHead>{t('students.table.phone')}</TableHead>
                  <TableHead className="text-right">{t('students.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
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
                      <TableCell className="font-medium whitespace-nowrap">{student.registrationNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">{student.fullName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="whitespace-nowrap">{student.serviceDepartment}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{student.phoneNumber}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('students.table.actions')}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t('students.actions.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/students/edit/${student.registrationNumber}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('students.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => setStudentToDelete(student)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('students.actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t('students.noStudents')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                    <Card key={student.registrationNumber} data-state={selectedRowKeys.has(student.registrationNumber) ? 'selected' : 'unselected'} className="data-[state=selected]:bg-muted/50">
                        <div className="flex items-start p-4 gap-4">
                            <div className="flex-shrink-0 pt-1">
                                <Checkbox
                                    checked={selectedRowKeys.has(student.registrationNumber)}
                                    onCheckedChange={(checked) => handleRowSelect(student.registrationNumber, !!checked)}
                                    aria-label={`Select ${student.fullName}`}
                                />
                            </div>
                            <Avatar className="w-12 h-12 flex-shrink-0">
                                <AvatarImage src={student.photo} alt={student.fullName} data-ai-hint="student portrait" />
                                <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow space-y-1">
                                <p className="font-semibold leading-tight">{student.fullName}</p>
                                <p className="text-sm text-muted-foreground">{student.registrationNumber}</p>
                                <div className="pt-1">
                                    <Badge variant="secondary">{student.serviceDepartment}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground pt-1">{student.phoneNumber}</p>
                            </div>
                            <div className="flex-shrink-0 -mr-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>{t('students.table.actions')}</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            {t('students.actions.view')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push(`/students/edit/${student.registrationNumber}`)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            {t('students.actions.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                            onClick={() => setStudentToDelete(student)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t('students.actions.delete')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </Card>
                ))
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    {t('students.noStudents')}
                </div>
            )}
          </div>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter>
            <PaginationControls />
          </CardFooter>
        )}
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
                <AlertDialogTitle>{t('students.deleteDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription dangerouslySetInnerHTML={{ __html: t('students.deleteDialog.description').replace('{name}', `<strong>${studentToDelete?.fullName}</strong>`) }} />
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setStudentToDelete(null)}>{t('students.deleteDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteStudent}>
                  {t('students.deleteDialog.confirm')}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

    