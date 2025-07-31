
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRightLeft, Search, Eye, Edit, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';
import { StudentDetailsDialog } from './student-details-dialog';
import { TransferStudentsDialog } from './transfer-students-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteStudent } from '@/lib/data';
import { Student, User } from '@prisma/client';
import { serviceDepartmentTransferMap, ServiceDepartment } from '@/lib/constants';

interface StudentActionsProps {
  students: Student[];
  users: User[];
  session: any;
  translations: {
    searchPlaceholder: string;
    transferButton: string;
    row: RowActionsTranslations;
  }
}

interface RowActionsTranslations {
    actions: string;
    view: string;
    edit: string;
    delete: string;
    deleteSuccess: string;
    deleteSuccessDescription: string;
    deleteDialog: {
        title: string;
        description: string;
        cancel: string;
        confirm: string;
    }
}


export function StudentActions({ students, users, session, translations }: StudentActionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const router = useRouter();

  const filteredStudents = useMemo(() => {
    let studentsToDisplay = students;
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      studentsToDisplay = studentsToDisplay.filter(student =>
        student.fullName.toLowerCase().includes(lowercasedQuery) ||
        student.registrationNumber.toLowerCase().includes(lowercasedQuery)
      );
    }
    return studentsToDisplay;
  }, [students, searchQuery]);
  
  const fromServiceDepartment = session.user.role !== 'super_admin' ? session.user.serviceDepartment : undefined;
  const canTransfer = fromServiceDepartment && !!serviceDepartmentTransferMap[fromServiceDepartment as ServiceDepartment];


  return (
    <>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-grow md:flex-grow-0 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={translations.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        {selectedRowKeys.size > 0 && (session.user.role !== 'super_admin' ? canTransfer : true) && (
          <Button onClick={() => setIsTransferDialogOpen(true)} className="shrink-0">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            {translations.transferButton.replace('{count}', String(selectedRowKeys.size))}
          </Button>
        )}
      </div>
      <TransferStudentsDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        selectedStudentIds={Array.from(selectedRowKeys)}
        students={students}
        currentUserRole={session.user.role}
        onTransferSuccess={() => {
            setSelectedRowKeys(new Set());
            router.refresh();
        }}
      />
      {/* Desktop Table View */}
      <div className="border rounded-lg overflow-x-auto hidden md:block w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  {/* Placeholder for potential future checkbox */}
                </TableHead>
                <TableHead className="w-[80px]">Photo</TableHead>
                <TableHead>Reg. Number</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.registrationNumber}>
                    <TableCell>
                      {/* Placeholder for checkbox */}
                    </TableCell>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={student.photo || undefined} alt={student.fullName} data-ai-hint="student portrait" />
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
                       <RowActions student={student} session={session} translations={translations.row}/>
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

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 w-full">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <Card key={student.registrationNumber}>
                  <div className="flex items-start p-4 gap-4">
                      <div className="flex-shrink-0 pt-1">
                          {/* Placeholder for checkbox */}
                      </div>
                      <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarImage src={student.photo || undefined} alt={student.fullName} data-ai-hint="student portrait" />
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
                        <RowActions student={student} session={session} translations={translations.row}/>
                      </div>
                  </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No students found.
            </div>
          )}
        </div>
    </>
  );
}


function RowActions({ student, session, translations }: { student: Student, session: any, translations: RowActionsTranslations }) {
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleViewDetails = () => {
        setIsDetailsDialogOpen(true);
    };

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;
        
        setIsDeleting(true);
        try {
            await deleteStudent(studentToDelete.id);
            toast({
                variant: "destructive",
                title: translations.deleteSuccess,
                description: translations.deleteSuccessDescription.replace('{name}', studentToDelete.fullName),
            });
            setStudentToDelete(null);
            router.refresh();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete student.',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{translations.actions}</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleViewDetails}>
                        <Eye className="mr-2 h-4 w-4" />
                        {translations.view}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/students/edit/${student.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {translations.edit}
                    </DropdownMenuItem>
                    {session.user.role === 'super_admin' && <DropdownMenuSeparator />}
                    {session.user.role === 'super_admin' &&
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => setStudentToDelete(student)}
                            disabled={isDeleting}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {translations.delete}
                        </DropdownMenuItem>
                    }
                </DropdownMenuContent>
            </DropdownMenu>

            <StudentDetailsDialog
                student={student}
                open={isDetailsDialogOpen}
                onOpenChange={setIsDetailsDialogOpen}
            />

            <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{translations.deleteDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription dangerouslySetInnerHTML={{ __html: translations.deleteDialog.description.replace('{name}', `<strong>${studentToDelete?.fullName}</strong>`) }} />
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setStudentToDelete(null)}>{translations.deleteDialog.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteStudent} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {translations.deleteDialog.confirm}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
