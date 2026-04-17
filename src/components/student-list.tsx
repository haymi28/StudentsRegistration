
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { deleteStudent, getClasses, deleteStudents } from '@/lib/data';
import { Student, Class } from '@prisma/client';
import { useLocale } from '@/contexts/locale-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type StudentWithClass = Student & { class: Class | null };

interface StudentListProps {
  initialStudents: StudentWithClass[];
  session: any;
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
    class: string;
    phone: string;
}


export function StudentList({ initialStudents, session }: StudentListProps) {
  const [students, setStudents] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const router = useRouter();
  const { t } = useLocale();
  const { toast } = useToast();

  useEffect(() => {
    setStudents(initialStudents);
    setSelectedRowKeys(new Set());
  }, [initialStudents]);

  const permissions = session.user.role.permissions as Record<string, boolean> || {};
  const isSuperAdmin = session.user.role.name === 'Super Admin';
  const canManageAll = isSuperAdmin;

  useEffect(() => {
    if (canManageAll) {
      getClasses().then(setAllClasses);
    }
  }, [canManageAll]);

  const translations = useMemo(() => ({
      title: t('students.title'),
      descriptionSuperAdmin: t('students.descriptionSuperAdmin'),
      descriptionAdmin: t('students.descriptionAdmin'),
      searchPlaceholder: t('students.searchPlaceholder'),
      noStudents: t('students.noStudents'),
      transferButton: t('students.transferButton'),
      deleteSelectedButton: t('students.deleteSelectedButton'),
      bulkDeleteDialog: {
        title: t('students.bulkDeleteDialog.title'),
        description: t('students.bulkDeleteDialog.description'),
        cancel: t('students.deleteDialog.cancel'),
        confirm: t('students.deleteDialog.confirm'),
      },
      rowActions: {
        actions: t('students.table.actions'),
        view: t('students.actions.view'),
        edit: t('students.actions.edit'),
        delete: t('students.actions.delete'),
        deleteSuccess: t('students.deleteSuccess'),
        deleteSuccessDescription: t('students.deleteSuccessDescription'),
        deleteDialog: {
          title: t('students.deleteDialog.title'),
          description: t('students.deleteDialog.description'),
          cancel: t('students.deleteDialog.cancel'),
          confirm: t('students.deleteDialog.confirm'),
        }
      },
      table: {
          photo: t('students.table.photo'),
          regNumber: t('students.table.regNumber'),
          fullName: t('students.table.fullName'),
          class: t('students.table.class'),
          phone: t('students.table.phone'),
      }
  }), [t]);

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

   const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      await deleteStudents(Array.from(selectedRowKeys));
      toast({
        title: t('students.bulkDeleteSuccess.title'),
        description: t('students.bulkDeleteSuccess.description', { count: selectedRowKeys.size }),
        variant: 'destructive',
      });
      setIsDeleteDialogOpen(false);
      setSelectedRowKeys(new Set());
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.errorDescription'),
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const filteredStudents = useMemo(() => {
    let studentsToDisplay = students;

    if (canManageAll && selectedClass !== 'all') {
      studentsToDisplay = studentsToDisplay.filter(student => student.classId === selectedClass);
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      studentsToDisplay = studentsToDisplay.filter(student =>
        student.fullName.toLowerCase().includes(lowercasedQuery) ||
        (student.registrationNumber && student.registrationNumber.toLowerCase().includes(lowercasedQuery))
      );
    }
    return studentsToDisplay;
  }, [students, searchQuery, selectedClass, canManageAll]);
  
  const canTransfer = isSuperAdmin;
  const canDelete = isSuperAdmin;


  return (
    <Card className="w-full">
       <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-grow">
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>
            {canManageAll
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
             {canManageAll && (
              <div className="w-full md:w-auto">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder={t('form.label.class')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('students.allClasses')}</SelectItem>
                    {allClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2 self-start md:self-center ml-auto">
                {selectedRowKeys.size > 0 && canTransfer && (
                  <Button onClick={() => setIsTransferDialogOpen(true)} className="shrink-0">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    {translations.transferButton.replace('{count}', String(selectedRowKeys.size))}
                  </Button>
                )}
                 {selectedRowKeys.size > 0 && canDelete && (
                  <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="shrink-0">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {translations.deleteSelectedButton.replace('{count}', String(selectedRowKeys.size))}
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
           <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{translations.bulkDeleteDialog.title}</AlertDialogTitle>
                <AlertDialogDescription>
                    {translations.bulkDeleteDialog.description.replace('{count}', String(selectedRowKeys.size))}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{translations.bulkDeleteDialog.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {translations.bulkDeleteDialog.confirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/* Desktop Table View */}
          <div className="border rounded-lg overflow-x-auto hidden md:block w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                        <Checkbox
                            checked={selectedRowKeys.size > 0 && filteredStudents.length > 0 && selectedRowKeys.size === filteredStudents.length}
                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                            aria-label="Select all students"
                            disabled={filteredStudents.length === 0}
                        />
                    </TableHead>
                    <TableHead className="w-[80px]">{translations.table.photo}</TableHead>
                    <TableHead>{translations.table.regNumber}</TableHead>
                    <TableHead>{translations.table.fullName}</TableHead>
                    <TableHead>{translations.table.class}</TableHead>
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
                           <RowActions student={student} session={session} translations={translations.rowActions} t={t}/>
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
                            <RowActions student={student} session={session} translations={translations.rowActions} t={t}/>
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


function RowActions({ student, session, translations, t }: { student: Student, session: any, translations: RowActionsTranslations, t: (key: string, params?: any) => string }) {
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
                description: t(translations.deleteSuccessDescription, { name: studentToDelete.fullName }),
            });
            setStudentToDelete(null);
            router.refresh();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: t('common.error'),
                description: t('common.errorDescription'),
            });
        } finally {
            setIsDeleting(false);
        }
    };
    
    const permissions = session.user.role.permissions as Record<string, boolean> || {};
    const isSuperAdmin = session.user.role.name === 'Super Admin';
    const canEdit = isSuperAdmin || permissions?.manage_class_students;
    const canDelete = isSuperAdmin;

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
                student={student as Student & { class: Class | null }}
                open={isDetailsDialogOpen}
                onOpenChange={setIsDetailsDialogOpen}
            />

            <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{translations.deleteDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription dangerouslySetInnerHTML={{ __html: t(translations.deleteDialog.description, { name: `<strong>${studentToDelete?.fullName}</strong>` }) }} />
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

    

    