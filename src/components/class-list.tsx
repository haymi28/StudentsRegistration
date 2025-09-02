
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
import { Edit, Trash2, MoreHorizontal, Loader2, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/contexts/locale-provider';
import { Class, User } from '@prisma/client';
import { deleteClass } from '@/lib/data';

type ClassWithDetails = Class & {
    manager: User | null;
    _count: { students: number };
};

interface ClassListProps {
  classes: ClassWithDetails[];
  translations: any;
}

export function ClassList({ classes, translations }: ClassListProps) {
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
        title: translations.deleteSuccess.title,
        description: t(translations.deleteSuccess.description, { name: classToDelete.name }),
      });
      setClassToDelete(null);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete class.',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{translations.title}</CardTitle>
            <CardDescription>{translations.description}</CardDescription>
          </div>
          <Button onClick={() => router.push('/classes/create')}>
            <Home className="mr-2 h-4 w-4" />
            {translations.createButton}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{translations.table.name}</TableHead>
                <TableHead>{translations.table.manager}</TableHead>
                <TableHead>{translations.table.studentCount}</TableHead>
                <TableHead className="text-right">{translations.table.actions}</TableHead>
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
                          <DropdownMenuLabel>{translations.table.actions}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/classes/edit/${c.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>{translations.actions.edit}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => setClassToDelete(c)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{translations.actions.delete}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {translations.noClasses}
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
            <AlertDialogTitle>{translations.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription dangerouslySetInnerHTML={{
                __html: classToDelete?._count.students > 0
                    ? translations.deleteDialog.descriptionWithStudents
                    : t(translations.deleteDialog.description, { name: `<strong>${classToDelete?.name}</strong>` })
            }}/>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClassToDelete(null)}>{translations.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClass} 
              disabled={isDeleting || (classToDelete?._count.students ?? 0) > 0} 
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {translations.deleteDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
