
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRightLeft, Search, Eye, Edit, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { StudentDetailsDialog } from './student-details-dialog';
import { TransferStudentsDialog } from './transfer-students-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteStudent } from '@/lib/data';
import { Student, User, Class } from '@prisma/client';

type StudentWithClass = Student & { class: Class | null };

interface StudentListProps {
  students: StudentWithClass[];
  users: Partial<User>[];
  session: any;
  translations: {
    title: string;
    descriptionSuperAdmin: string;
    descriptionAdmin: string;
    searchPlaceholder: string;
    transferButton: string;
    noStudents: string;
    rowActions: RowActionsTranslations;
    table: TableTranslations;
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

interface TableTranslations {
    photo: string;
    regNumber: string;
    fullName: string;
    department: string;
    phone: string;
}


export function StudentList({ students, users, session, translations }: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const router = useRouter();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(new Set(filteredStudents.map(s => s.id)));
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
  
  const canTransfer = session.user.role === 'super_admin';


  return (
    <Card className="w-full">
       <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-grow">
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>
            {session.user.role === 'super_admin'
              ? translations.descriptionSuperAdmin
              : translations.descriptionAdmin}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full mb-4">
            <div className="relative flex-grow w-full md:flex-grow-0 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={translations.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2 self-start md:self-center">
                {selectedRowKeys.size > 0 && canTransfer && (
                  <Button onClick={() => setIsTransferDialogOpen(true)} className="shrink-0">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    {translations.transferButton.replace('{count}', String(selectedRowKeys.size))}
                  </Button>
                )}
            </div>
          </div>
          <TransferStudentsDialog
            open={isTransferDialogOpen}
            onOpenChange={setIsTransferDialogOpen}
            selectedStudentIds={Array.from(selectedRowKeys)}
            students={students}
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
                        <Checkbox
                            checked={selectedRowKeys.size > 0 && selectedRowKeys.size === filteredStudents.length}
                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                            aria-label="Select all students"
                            disabled={filteredStudents.length === 0}
                        />
                    </TableHead>
                    <TableHead className="w-[80px]">{translations.table.photo}</TableHead>
                    <TableHead>{translations.table.regNumber}</TableHead>
                    <TableHead>{translations.table.fullName}</TableHead>
                    <TableHead>{translations.table.department}</TableHead>
                    <TableHead>{translations.table.phone}</TableHead>
                    <TableHead className="text-right">{translations.rowActions.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                                checked={selectedRowKeys.has(student.id)}
                                onCheckedChange={(checked) => handleRowSelect(student.id, !!checked)}
                                aria-label={`Select student ${student.registrationNumber}`}
                            />
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
                          <Badge variant="secondary" className="whitespace-nowrap">{student.class?.name || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{student.phoneNumber}</TableCell>
                        <TableCell className="text-right">
                           <RowActions student={student} session={session} translations={translations.rowActions}/>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {translations.noStudents}
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
                  <Card key={student.id}>
                      <div className="flex items-start p-4 gap-4">
                          <div className="flex-shrink-0 pt-1">
                              <Checkbox
                                    checked={selectedRowKeys.has(student.id)}
                                    onCheckedChange={(checked) => handleRowSelect(student.id, !!checked)}
                                    aria-label={`Select student ${student.registrationNumber}`}
                                />
                          </div>
                          <Avatar className="w-12 h-12 flex-shrink-0">
                              <AvatarImage src={student.photo || undefined} alt={student.fullName} data-ai-hint="student portrait" />
                              <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-grow space-y-1">
                              <p className="font-semibold leading-tight">{student.fullName}</p>
                              <p className="text-sm text-muted-foreground">{student.registrationNumber}</p>
                              <div className="pt-1">
                                  <Badge variant="secondary">{student.class?.name || 'N/A'}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground pt-1">{student.phoneNumber}</p>
                          </div>
                          <div className="flex-shrink-0 -mr-2">
                            <RowActions student={student} session={session} translations={translations.rowActions}/>
                          </div>
                      </div>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  {translations.noStudents}
                </div>
              )}
            </div>
      </CardContent>
    </Card>
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
    
    const canEdit = session.user.role === 'super_admin' || session.user.role === 'admin';
    const canDelete = session.user.role === 'super_admin';

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
                    {canEdit && (
                        <DropdownMenuItem onClick={() => router.push(`/students/edit/${student.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {translations.edit}
                        </DropdownMenuItem>
                    )}
                    {canDelete && <DropdownMenuSeparator />}
                    {canDelete &&
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
                        <AlertDialogAction onClick={handleDeleteStudent} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {translations.deleteDialog.confirm}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
