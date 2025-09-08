
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
import { Edit, Trash2, MoreHorizontal, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/contexts/locale-provider';
import { Role } from '@prisma/client';
import { deleteRole } from '@/lib/data';

type RoleWithDetails = Role & {
    _count: { users: number };
};

interface RoleListProps {
  roles: RoleWithDetails[];
}

export function RoleList({ roles }: RoleListProps) {
  const [roleToDelete, setRoleToDelete] = useState<RoleWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocale();

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRole(roleToDelete.id);
      toast({
        title: t('roles.deleteSuccess.title'),
        description: t('roles.deleteSuccess.description', { name: roleToDelete.name }),
      });
      setRoleToDelete(null);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete role.',
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
            <CardTitle>{t('roles.title')}</CardTitle>
            <CardDescription>{t('roles.description')}</CardDescription>
          </div>
          <Button onClick={() => router.push('/roles/create')}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            {t('roles.createButton')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('roles.table.name')}</TableHead>
                <TableHead>{t('roles.table.description')}</TableHead>
                <TableHead>{t('roles.table.usersCount')}</TableHead>
                <TableHead className="text-right">{t('roles.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length > 0 ? (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>{role._count.users}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={role.name === 'Super Admin'}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('roles.table.actions')}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/roles/edit/${role.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>{t('students.actions.edit')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => setRoleToDelete(role)}
                            disabled={isDeleting || ['Super Admin', 'Admin', 'Teacher'].includes(role.name)}
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
                    {t('roles.noRoles')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('roles.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription dangerouslySetInnerHTML={{
              __html: roleToDelete?._count.users > 0
                ? t('roles.deleteDialog.descriptionWithUsers')
                : t('roles.deleteDialog.description', { name: `<strong>${roleToDelete?.name}</strong>` })
            }} />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToDelete(null)}>{t('students.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRole} 
              disabled={isDeleting || (roleToDelete?._count.users ?? 0) > 0} 
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
