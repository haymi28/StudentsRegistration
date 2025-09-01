
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
import { Edit, Trash2, MoreHorizontal, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Role } from '@prisma/client';
import { deleteRole } from '@/lib/data';

type RoleWithDetails = Role & {
    _count: { users: number };
};

interface RoleListProps {
  roles: RoleWithDetails[];
  translations: any;
}

export function RoleList({ roles, translations }: RoleListProps) {
  const [roleToDelete, setRoleToDelete] = useState<RoleWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRole(roleToDelete.id);
      toast({
        title: translations.deleteSuccess.title,
        description: translations.deleteSuccess.description.replace('{name}', roleToDelete.name),
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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{translations.title}</CardTitle>
            <CardDescription>{translations.description}</CardDescription>
          </div>
          <Button onClick={() => router.push('/roles/create')}>
            <ShieldCheck className="mr-2 h-4 w-4" />
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
                <TableHead>{translations.table.description}</TableHead>
                <TableHead>{translations.table.usersCount}</TableHead>
                <TableHead className="text-right">{translations.table.actions}</TableHead>
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
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={['Super Admin', 'Admin', 'Teacher'].includes(role.name)}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{translations.table.actions}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/roles/edit/${role.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>{translations.actions.edit}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => setRoleToDelete(role)}
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
                    {translations.noRoles}
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
            <AlertDialogTitle>{translations.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {roleToDelete?._count.users > 0
                ? translations.deleteDialog.descriptionWithUsers
                : translations.deleteDialog.description.replace('{name}', `<strong>${roleToDelete?.name}</strong>`)
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToDelete(null)}>{translations.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRole} 
              disabled={isDeleting || (roleToDelete?._count.users ?? 0) > 0} 
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
