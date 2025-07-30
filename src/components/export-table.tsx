
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Student } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/contexts/locale-provider';
import { exportToExcel } from '@/lib/excel-utils';

const STUDENTS_PER_PAGE = 10;

interface ExportTableProps {
    students: Student[];
}

export function ExportTable({ students: initialStudents }: ExportTableProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
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

  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + STUDENTS_PER_PAGE);
  }, [filteredStudents, currentPage]);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(new Set(students.map(s => s.id)));
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
  
  const handleExport = () => {
    const studentsToExport = students.filter(s => selectedRowKeys.has(s.id));
    if (studentsToExport.length === 0) {
      toast({
        variant: 'destructive',
        title: t('export.noSelectionTitle'),
        description: t('export.noSelectionDescription'),
      });
      return;
    }
    exportToExcel(studentsToExport, `student_export_${new Date().toISOString().split('T')[0]}.xlsx`, t);
    toast({
        title: t('export.successTitle'),
        description: t('export.successDescription').replace('{count}', String(studentsToExport.length)),
    });
  };

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
    <CardContent>
        <div className="flex items-center gap-2 w-full justify-end mb-4">
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder={t('students.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
                />
            </div>
            <Button onClick={handleExport} disabled={selectedRowKeys.size === 0}>
                <Download className="mr-2 h-4 w-4" />
                {t('export.button').replace('{count}', String(selectedRowKeys.size))}
            </Button>
        </div>
       <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedRowKeys.size > 0 && selectedRowKeys.size === students.length}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all students"
                />
              </TableHead>
              <TableHead className="w-[80px]">{t('students.table.photo')}</TableHead>
              <TableHead>{t('students.table.regNumber')}</TableHead>
              <TableHead>{t('students.table.fullName')}</TableHead>
              <TableHead>{t('students.table.department')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <TableRow key={student.id} data-state={selectedRowKeys.has(student.id) && "selected"}>
                  <TableCell>
                      <Checkbox
                          checked={selectedRowKeys.has(student.id)}
                          onCheckedChange={(checked) => handleRowSelect(student.id, !!checked)}
                          aria-label={`Select student ${student.registrationNumber}`}
                      />
                  </TableCell>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={student.photo || ''} alt={student.fullName} data-ai-hint="student portrait" />
                      <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{student.registrationNumber}</TableCell>
                  <TableCell className="whitespace-nowrap">{student.fullName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="whitespace-nowrap">{student.serviceDepartment}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t('students.noStudents')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
     {totalPages > 1 && (
      <CardFooter>
        <PaginationControls />
      </CardFooter>
    )}
    </>
  );
}
