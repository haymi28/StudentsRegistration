
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
import { ArrowRightLeft, Search, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { StudentDetailsDialog } from './student-details-dialog';
import { TransferStudentsDialog } from './transfer-students-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/contexts/locale-provider';
import { deleteStudent } from '@/lib/data';
import { Student, User } from '@prisma/client';
import { ServiceDepartment, UserRole, serviceDepartmentTransferMap } from '@/lib/auth';

interface StudentActionsProps {
  students: Student[];
  users: User[];
  session: any;
}

export function StudentActions({ students, users, session }: StudentActionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const { t } = useLocale();

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
      {selectedRowKeys.size > 0 && (session.user.role !== 'super_admin' ? canTransfer : true) && (
        <Button onClick={() => setIsTransferDialogOpen(true)} className="shrink-0">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          {t('students.transferButton').replace('{count}', String(selectedRowKeys.size))}
        </Button>
      )}
      <TransferStudentsDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        selectedStudentIds={Array.from(selectedRowKeys)}
        students={students}
        currentUserRole={session.user.role}
        onTransferSuccess={() => {}} // This needs to be implemented with server actions
      />
    </div>
  );
}


function RowActions({ student, session }: { student: Student, session: any }) {
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const { t } = useLocale();
    const router = useRouter();
    const { toast } = useToast();

    const handleViewDetails = () => {
        setIsDetailsDialogOpen(true);
    };

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;
        
        await deleteStudent(studentToDelete.id);

        toast({
            variant: "destructive",
            title: t('students.deleteSuccess'),
            description: t('students.deleteSuccessDescription').replace('{name}', studentToDelete.fullName),
        });
        setStudentToDelete(null);
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
                    <DropdownMenuLabel>{t('students.table.actions')}</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleViewDetails}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t('students.actions.view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/students/edit/${student.id}`)}>
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

            <StudentDetailsDialog
                student={student}
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

StudentActions.RowActions = RowActions;

