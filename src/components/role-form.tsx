
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
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

type RoleFormValues = z.infer<ReturnType<typeof getRoleSchema>>;

const allPermissionsList = [
    'view_dashboard',
    'view_students',
    'manage_class_students',
    'manage_classes',
    'manage_users',
    'manage_roles',
    'import_students_text',
    'import_students_photos',
    'export_students_text',
    'export_students_photos',
    'transfer_students',
    'manage_all_students',
];

interface PermissionItem {
    id: string;
    labelKey: string;
    permission?: string;
    children?: PermissionItem[];
}

const permissionHierarchy: PermissionItem[] = [
    { id: 'dashboard', labelKey: 'nav.dashboard', permission: 'view_dashboard' },
    { id: 'students', labelKey: 'nav.students', permission: 'view_students' },
    { id: 'new_student', labelKey: 'nav.newStudent', permission: 'manage_class_students' },
    { 
        id: 'settings', 
        labelKey: 'nav.settings', 
        children: [
            { id: 'class_mgmt', labelKey: 'nav.classManagement', permission: 'manage_classes' },
            { id: 'user_mgmt', labelKey: 'nav.userManagement', permission: 'manage_users' },
            { id: 'role_mgmt', labelKey: 'nav.roleManagement', permission: 'manage_roles' },
        ]
    },
    { id: 'import_text', labelKey: 'nav.importText', permission: 'import_students_text' },
    { id: 'export_text', labelKey: 'nav.exportText', permission: 'export_students_text' },
    { id: 'import_photos', labelKey: 'nav.importPhotos', permission: 'import_students_photos' },
    { id: 'export_photos', labelKey: 'nav.exportPhotos', permission: 'export_students_photos' },
    { id: 'transfer_students', labelKey: 'permissions.transfer_students.title', permission: 'transfer_students' },
    { id: 'manage_all_students', labelKey: 'permissions.manage_all_students.title', permission: 'manage_all_students' },
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isSuperAdminRole = roleToEdit?.name === 'Super Admin';

  const renderPermissionItem = (item: PermissionItem, depth = 0) => {
    return (
      <div key={item.id} className={cn("space-y-3", depth > 0 && "ml-6 mt-3 border-l pl-4")}>
        {item.permission ? (
          <FormField
            control={form.control}
            name="permissions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(item.permission!)}
                    disabled={isSuperAdminRole}
                    onCheckedChange={(checked) => {
                      return checked
                        ? field.onChange([...(field.value || []), item.permission])
                        : field.onChange(field.value?.filter((value: string) => value !== item.permission));
                    }}
                  />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer text-sm">
                  {t(item.labelKey)}
                </FormLabel>
              </FormItem>
            )}
          />
        ) : (
          <div className="py-2">
            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {t(item.labelKey)}
            </h4>
          </div>
        )}
        {item.children && (
            <div className="grid gap-2">
                {item.children.map((child) => renderPermissionItem(child, depth + 1))}
            </div>
        )}
      </div>
    );
  };

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
                    <Textarea placeholder={translations.placeholders.description} {...field} readOnly={isSuperAdminRole} />
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
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                            {permissionHierarchy.map((item) => renderPermissionItem(item))}
                        </div>
                    </FormItem>
                )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            {!isSuperAdminRole && (
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {translations.buttons.submit}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
