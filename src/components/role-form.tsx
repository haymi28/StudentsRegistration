
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
import { useState, useMemo } from 'react';

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
];

interface RoleFormProps {
  roleToEdit?: Role;
  translations: any;
}

export function RoleForm({ roleToEdit, translations }: RoleFormProps) {
  const { t } = useLocale();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isEditMode = !!roleToEdit;

  const validationSchema = getRoleSchema();

  const defaultPermissions = useMemo(() => {
    if (roleToEdit?.permissions && typeof roleToEdit.permissions === 'object') {
        return Object.keys(roleToEdit.permissions).filter(
            key => (roleToEdit.permissions as Record<string, boolean>)[key]
        );
    }
    return [];
  }, [roleToEdit]);


  const form = useForm<RoleFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: roleToEdit?.name || '',
      description: roleToEdit?.description || '',
      permissions: defaultPermissions,
    },
  });

  async function onSubmit(data: RoleFormValues) {
    setIsLoading(true);
    try {
      const permissionsObject = data.permissions?.reduce((acc, perm) => {
        acc[perm] = true;
        return acc;
      }, {} as Record<string, boolean>) || {};

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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isDefaultRole = ['Super Admin', 'Admin', 'Teacher'].includes(roleToEdit?.name || '');

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
                    <Input placeholder={translations.placeholders.name} {...field} readOnly={isDefaultRole} />
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
            <FormItem>
                <div className="mb-4">
                    <FormLabel className="text-base">{translations.labels.permissions}</FormLabel>
                    <FormDescription>{t('roles.form.permissionsDescription')}</FormDescription>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Controller
                    control={form.control}
                    name="permissions"
                    render={({ field }) => (
                        <>
                        {allPermissionsList.map((permissionId) => (
                            <FormItem
                                key={permissionId}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                            >
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(permissionId)}
                                    onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        if (checked) {
                                            field.onChange([...currentValue, permissionId]);
                                        } else {
                                            field.onChange(currentValue.filter(id => id !== permissionId));
                                        }
                                    }}
                                    disabled={isDefaultRole}
                                />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="font-normal">{t(`permissions.${permissionId}.title`)}</FormLabel>
                                    <FormDescription>{t(`permissions.${permissionId}.description`)}</FormDescription>
                                </div>
                            </FormItem>
                        ))}
                        </>
                    )}
                />
                </div>
                <FormMessage />
            </FormItem>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || isDefaultRole}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? translations.buttons.loading : translations.buttons.submit}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
