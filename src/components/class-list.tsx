
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreHorizontal, Loader2, Home, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/contexts/locale-provider';
import { Class, User } from '@prisma/client';
import { deleteClass } from '@/lib/data';
import { extractAppError } from '@/lib/errors';

type ClassWithDetails = Class & {
    manager: User | null;
    _count: { students: number };
};

interface ClassListProps {
  classes: ClassWithDetails[];
}

export function ClassList({ classes }: ClassListProps) {
  const [classToDelete, setClassToDelete] = useState<ClassWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocale();

  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    setIsDeleting(true);
    try {
      await deleteClass(classToDelete.id);
      toast({
        title: t('classes.deleteSuccess.title'),
        description: t('classes.deleteSuccess.description', { name: classToDelete.name }),
      });
      setClassToDelete(null);
      router.refresh();
    } catch (error) {
      // Handle our custom AppError and use exact messages
      let description = t('common.errorDescription');
      const appError = extractAppError(error);
      if (appError) {
        // Use the exact message from the backend
        description = appError.message;
      }
      
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: description,
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
            <Button variant="outline" onClick={() => router.push('/settings')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.back')}
            </Button>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{t('classes.title')}</CardTitle>
            <CardDescription>{t('classes.description')}</CardDescription>
          </div>
          <Button onClick={() => router.push('/classes/create')}>
            <Home className="mr-2 h-4 w-4" />
            {t('classes.createButton')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('classes.table.name')}</TableHead>
                <TableHead>{t('classes.table.manager')}</TableHead>
                <TableHead>{t('classes.table.studentCount')}</TableHead>
                <TableHead className="text-right">{t('classes.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length > 0 ? (
                classes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.manager?.displayName || 'N/A'}</TableCell>
                    <TableCell>{c._count.students}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('classes.table.actions')}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/classes/edit/${c.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>{t('students.actions.edit')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => setClassToDelete(c)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{t('students.actions.delete')}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {t('classes.noClasses')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <AlertDialog open={!!classToDelete} onOpenChange={(open) => !open && setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('classes.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription dangerouslySetInnerHTML={{
                __html: classToDelete?._count.students > 0
                    ? t('classes.deleteDialog.descriptionWithStudents')
                    : t('classes.deleteDialog.description', { name: `<strong>${classToDelete?.name}</strong>` })
            }}/>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClassToDelete(null)}>{t('students.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClass} 
              disabled={isDeleting || (classToDelete?._count.students ?? 0) > 0} 
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('students.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
