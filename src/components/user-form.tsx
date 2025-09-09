
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { User, Role } from '@prisma/client';
import { getCreateUserSchema, getUpdateUserSchema } from '@/lib/validations/user';
import { createUser, updateUser, getRoles } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { PasswordInput } from './password-input';

type UserFormValues = z.infer<ReturnType<typeof getCreateUserSchema>>;

interface UserFormProps {
  userToEdit?: User & { role: Role };
}

export function UserForm({ userToEdit }: UserFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const router = useRouter();
  const isEditMode = !!userToEdit;
  const { t } = useLocale();

  const translations = useMemo(() => ({
    title: isEditMode ? t('users.form.editTitle') : t('users.form.createTitle'),
    description: isEditMode ? t('users.form.editDescription') : t('users.form.createDescription'),
    labels: {
        displayName: t('users.form.label.displayName'),
        username: t('users.form.label.username'),
        password: t('users.form.label.password'),
        confirmPassword: t('users.form.label.confirmPassword'),
        role: t('users.form.label.role'),
        status: t('users.form.label.status'),
        active: t('users.form.label.active'),
        inactive: t('users.form.label.inactive'),
    },
    placeholders: {
        selectRole: t('users.form.placeholder.selectRole'),
        password: t('users.form.placeholder.passwordOptional')
    },
    buttons: {
        submit: isEditMode ? t('form.save') : t('form.submit'),
        loading: t('form.loading'),
    },
    success: {
        title: isEditMode ? t('users.form.updateSuccess.title') : t('users.form.createSuccess.title'),
        description: isEditMode ? t('users.form.updateSuccess.description') : t('users.form.createSuccess.description'),
    }
  }), [t, isEditMode]);

  useEffect(() => {
    getRoles().then(setRoles);
  }, []);

  const validationSchema = useMemo(() => {
    return isEditMode ? getUpdateUserSchema(t) : getCreateUserSchema(t);
  }, [isEditMode, t]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: isEditMode
      ? {
          displayName: userToEdit.displayName,
          username: userToEdit.username,
          roleId: userToEdit.roleId,
          isActive: userToEdit.isActive,
          password: '',
          confirmPassword: '',
        }
      : {
          displayName: '',
          username: '',
          roleId: undefined,
          isActive: true,
          password: '',
          confirmPassword: '',
        },
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
          title: translations.success.title,
          description: translations.success.description.replace('{username}', data.username)
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

  const isSuperAdminRole = userToEdit?.role.name === 'Super Admin';

  return (
    <Card className="w-full shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField control={form.control} name="displayName" render={({ field }) => (
                <FormItem><FormLabel>{translations.labels.displayName}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>{translations.labels.username}</FormLabel><FormControl><Input {...field} readOnly={isEditMode} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{translations.labels.password}</FormLabel>
                        <PasswordInput field={field} placeholder={isEditMode ? translations.placeholders.password : '••••••••'} />
                        {isEditMode && <FormDescription>{translations.placeholders.password}</FormDescription>}
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{translations.labels.confirmPassword}</FormLabel>
                        <PasswordInput field={field} />
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="roleId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{translations.labels.role}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSuperAdminRole}>
                            <FormControl><SelectTrigger><SelectValue placeholder={translations.placeholders.selectRole} /></SelectTrigger></FormControl>
                            <SelectContent>
                                {roles.map(role => <SelectItem key={role.id} value={role.id} disabled={role.name === 'Super Admin'}>{role.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-8">
                            <div className="space-y-0.5">
                                <FormLabel>{translations.labels.status}</FormLabel>
                                <FormDescription>{field.value ? translations.labels.active : translations.labels.inactive}</FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isSuperAdminRole}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? translations.buttons.loading : (isEditMode ? translations.buttons.submit : translations.buttons.submit)}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
