
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client';
import { getRoleSchema } from '@/lib/validations/role';
import { createRole, updateRole } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { useState, useMemo, useEffect } from 'react';
import { extractAppError } from '@/lib/errors';

type RoleFormValues = z.infer<ReturnType<typeof getRoleSchema>>;

const allPermissionsList = [
    'manage_users',
    'manage_roles',
    'manage_classes',
    'manage_all_students',
    'manage_class_students',
    'view_students',
    'import_students',
    'export_students',
    'transfer_students',
];

interface RoleFormProps {
  roleToEdit?: Role;
}

export function RoleForm({ roleToEdit }: RoleFormProps) {
  const { t } = useLocale();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isEditMode = !!roleToEdit;

  const translations = useMemo(() => ({
    createTitle: t('roles.form.createTitle'),
    createDescription: t('roles.form.createDescription'),
    editTitle: t('roles.form.editTitle'),
    editDescription: t('roles.form.editDescription'),
    labels: {
        name: t('roles.form.label.name'),
        description: t('roles.form.label.description'),
        permissions: t('roles.form.label.permissions'),
    },
    placeholders: {
        name: t('roles.form.placeholder.name'),
        description: t('roles.form.placeholder.description'),
    },
    buttons: {
        submit: isEditMode ? t('form.save') : t('roles.form.createButton'),
        loading: t('form.loading'),
    },
    success: {
        title: isEditMode ? t('roles.form.updateSuccess.title') : t('roles.form.createSuccess.title'),
        description: isEditMode ? t('roles.form.updateSuccess.description') : t('roles.form.createSuccess.description'),
    },
  }), [t, isEditMode]);

  const validationSchema = getRoleSchema();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  useEffect(() => {
    if (roleToEdit) {
      const currentPermissions = roleToEdit.permissions && typeof roleToEdit.permissions === 'object'
        ? Object.keys(roleToEdit.permissions).filter(
            key => (roleToEdit.permissions as Record<string, boolean>)[key]
          )
        : [];
      
      form.reset({
        name: roleToEdit.name,
        description: roleToEdit.description || '',
        permissions: currentPermissions,
      });
    }
  }, [roleToEdit, form]);

  async function onSubmit(data: RoleFormValues) {
    setIsLoading(true);
    try {
      const permissionsObject = allPermissionsList.reduce((acc, perm) => {
        acc[perm] = data.permissions?.includes(perm) || false;
        return acc;
      }, {} as Record<string, boolean>);
      

      const dataToSubmit = {
        name: data.name,
        description: data.description,
        permissions: permissionsObject,
      };

      if (isEditMode) {
        await updateRole(roleToEdit.id, dataToSubmit);
        toast({
          title: translations.success.title,
          description: translations.success.description.replace('{name}', data.name),
        });
      } else {
        await createRole(dataToSubmit);
        toast({
          title: translations.success.title,
          description: translations.success.description.replace('{name}', data.name),
        });
      }
      router.push('/roles');
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
      setIsLoading(false);
    }
  }

  const isSuperAdminRole = roleToEdit?.name === 'Super Admin';

  return (
    <Card className="w-full shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.labels.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={translations.placeholders.name} {...field} readOnly={isSuperAdminRole} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.labels.description}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={translations.placeholders.description} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="permissions"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">{translations.labels.permissions}</FormLabel>
                            <FormDescription>{t('roles.form.permissionsDescription')}</FormDescription>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allPermissionsList.map((permissionId) => (
                             <FormField
                                key={permissionId}
                                control={form.control}
                                name="permissions"
                                render={({ field }) => {
                                return (
                                    <FormItem
                                        key={permissionId}
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(permissionId)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...field.value, permissionId])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                            (value) => value !== permissionId
                                                        )
                                                    )
                                            }}
                                            disabled={isSuperAdminRole}
                                        />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="font-normal">{t(`permissions.${permissionId}.title`)}</FormLabel>
                                            <FormDescription>{t(`permissions.${permissionId}.description`)}</FormDescription>
                                        </div>
                                    </FormItem>
                                    )
                                }}
                            />
                        ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || isSuperAdminRole}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? translations.buttons.loading : translations.buttons.submit}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
