
'use client';

import { useForm } from 'react-hook-form';
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
    { id: 'manage_users', description: 'Create, edit, and delete users' },
    { id: 'manage_roles', description: 'Create, edit, and delete roles and their permissions' },
    { id: 'manage_classes', description: 'Create, edit, and delete classes and assign managers' },
    { id: 'manage_all_students', description: 'View, edit, and delete any student in any class' },
    { id: 'manage_class_students', description: 'View, edit, and delete students in their own class' },
    { id: 'view_students', description: 'View students in their own class' },
    { id: 'import_students', description: 'Bulk import students from a file' },
    { id: 'export_students', description: 'Export student data' },
];

interface RoleFormProps {
  roleToEdit?: Role;
  translations: any;
}

export function RoleForm({ roleToEdit, translations }: RoleFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isEditMode = !!roleToEdit;
  const currentPermissions = useMemo(() => {
    if (roleToEdit?.permissions && typeof roleToEdit.permissions === 'object') {
        return roleToEdit.permissions as Record<string, boolean>;
    }
    return {};
  }, [roleToEdit]);

  const validationSchema = getRoleSchema();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: isEditMode
      ? {
          name: roleToEdit.name,
          description: roleToEdit.description || '',
          permissions: currentPermissions,
        }
      : {
          name: '',
          description: '',
          permissions: {},
        },
  });

  async function onSubmit(data: RoleFormValues) {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await updateRole(roleToEdit.id, data);
        toast({
          title: translations.success.title,
          description: translations.success.description.replace('{name}', data.name),
        });
      } else {
        await createRole(data);
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
            <FormField
                control={form.control}
                name="permissions"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">{translations.labels.permissions}</FormLabel>
                            <FormDescription>Select the permissions for this role.</FormDescription>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allPermissionsList.map((permission) => (
                            <FormField
                                key={permission.id}
                                control={form.control}
                                name={`permissions.${permission.id}`}
                                render={({ field }) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isDefaultRole}
                                        />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="font-normal">{permission.id.replace(/_/g, ' ')}</FormLabel>
                                            <FormDescription>{permission.description}</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        ))}
                        </div>
                    <FormMessage />
                    </FormItem>
                )}
            />
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
