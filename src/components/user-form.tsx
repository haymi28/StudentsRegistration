
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';
import { getCreateUserSchema, getUpdateUserSchema } from '@/lib/validations/user';
import { createUser, updateUser } from '@/lib/data';
import { UserRole, serviceDepartments as serviceDepartmentConstants } from '@/lib/constants';
import { useLocale } from '@/contexts/locale-provider';

type UserFormValues = z.infer<ReturnType<typeof getCreateUserSchema>>;

interface UserFormProps {
  userToEdit?: User;
  translations: any;
}

export function UserForm({ userToEdit, translations }: UserFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isEditMode = !!userToEdit;
  const { t } = useLocale();

  const validationSchema = useMemo(() => {
    return isEditMode ? getUpdateUserSchema(t) : getCreateUserSchema(t);
  }, [isEditMode, t]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: isEditMode
      ? {
          displayName: userToEdit.displayName,
          username: userToEdit.username,
          role: userToEdit.role as UserRole,
          serviceDepartment: userToEdit.serviceDepartment || undefined,
          isActive: userToEdit.isActive,
          password: '',
          confirmPassword: '',
        }
      : {
          displayName: '',
          username: '',
          role: undefined,
          serviceDepartment: undefined,
          isActive: true,
          password: '',
          confirmPassword: '',
        },
  });

  const selectedRole = useWatch({
    control: form.control,
    name: 'role',
  });

  async function onSubmit(data: UserFormValues) {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await updateUser(userToEdit.id, data);
      } else {
        await createUser(data);
      }
      toast({
        title: isEditMode ? t('users.form.updateSuccess') : t('users.form.createSuccess'),
        description: (isEditMode ? t('users.form.updateSuccessDescription') : t('users.form.createSuccessDescription')).replace('{username}', data.username),
      });
      router.push('/users');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const departmentOptions = useMemo(() => Object.entries({
    children_1: t('serviceDepartment.children_1'),
    children_2: t('serviceDepartment.children_2'),
    junior: t('serviceDepartment.junior'),
    senior: t('serviceDepartment.senior'),
    youth: t('serviceDepartment.youth'),
  }).map(([key, value], index) => ({
      value: serviceDepartmentConstants[index],
      label: value,
  })), [t]);

  const roleOptions = useMemo(() => Object.entries({
      super_admin: t('roles.super_admin'),
      admin: t('roles.admin'),
      teacher: t('roles.teacher'),
  }).map(([key, value]) => ({
      value: key,
      label: value,
  })), [t]);

  return (
    <Card className="w-full shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField control={form.control} name="displayName" render={({ field }) => (
                <FormItem><FormLabel>{t('users.form.label.displayName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>{t('users.form.label.username')}</FormLabel><FormControl><Input {...field} readOnly={isEditMode} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('users.form.label.password')}</FormLabel>
                        <FormControl><Input type="password" {...field} placeholder={isEditMode ? t('users.form.placeholder.password') : ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('users.form.label.confirmPassword')}</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            
            <Separator />
            
            <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('users.form.label.role')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={userToEdit?.username === 'superadmin'}>
                            <FormControl><SelectTrigger><SelectValue placeholder={t('users.form.placeholder.selectRole')} /></SelectTrigger></FormControl>
                            <SelectContent>
                                {roleOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label as any}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="serviceDepartment" render={({ field }) => (
                    <FormItem style={{ display: selectedRole === 'admin' || selectedRole === 'teacher' ? 'block' : 'none' }}>
                        <FormLabel>{t('users.form.label.department')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder={t('users.form.placeholder.selectDepartment')} /></SelectTrigger></FormControl>
                            <SelectContent>
                                {departmentOptions.map(dep => <SelectItem key={dep.value} value={dep.value}>{dep.label as any}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
             <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel>{t('users.form.label.status')}</FormLabel>
                            <FormDescription>{field.value ? t('users.form.label.active') : t('users.form.label.inactive')}</FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={userToEdit?.username === 'superadmin'}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t('form.loading') : (isEditMode ? t('form.save') : t('form.submit'))}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
