
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, MoreHorizontal, Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/contexts/locale-provider';
import { User, Role } from '@prisma/client';
import { deleteUser } from '@/lib/data';
import { getUserFacingErrorMessage } from '@/lib/errors';

type UserWithRole = User & { role: Role };

interface UserListProps {
  users: UserWithRole[];
}

export function UserList({ users }: UserListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocale();

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowercasedQuery = searchQuery.toLowerCase();
    return users.filter(user =>
      user.displayName.toLowerCase().includes(lowercasedQuery) ||
      user.username.toLowerCase().includes(lowercasedQuery)
    );
  }, [users, searchQuery]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      toast({
        title: t('users.deleteSuccess.title'),
        description: t('users.deleteSuccess.description', { name: userToDelete.displayName }),
      });
      setUserToDelete(null);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: getUserFacingErrorMessage(error, t),
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
            <CardTitle>{t('users.title')}</CardTitle>
            <CardDescription>{t('users.description')}</CardDescription>
          </div>
          <Button onClick={() => router.push('/users/create')}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('users.createUserButton')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('users.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full max-w-sm"
            />
          </div>
        </div>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('users.table.displayName')}</TableHead>
                <TableHead>{t('users.table.username')}</TableHead>
                <TableHead>{t('users.table.role')}</TableHead>
                <TableHead>{t('users.table.status')}</TableHead>
                <TableHead className="text-right">{t('users.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.displayName}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'secondary' : 'destructive'}>
                        {user.isActive ? t('users.form.label.active') : t('users.form.label.inactiveShort')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={user.username === 'superadmin'}>
                            <span className="sr-only">{t('common.openMenu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('users.table.actions')}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/users/edit/${user.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>{t('students.actions.edit')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => setUserToDelete(user)}
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
                  <TableCell colSpan={5} className="h-24 text-center">
                    {t('users.noUsers')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription dangerouslySetInnerHTML={{ __html: t('users.deleteDialog.description', { name: `<strong>${userToDelete?.displayName}</strong>`}) }} />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>{t('students.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('students.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
