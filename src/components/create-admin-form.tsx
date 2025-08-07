'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/contexts/locale-provider';
import { createUser } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { roleToServiceDepartmentMap, UserRole } from '@/lib/constants';
import { User } from '@prisma/client';

const getCreateAdminSchema = (t: (key: string) => string) => z.object({
  username: z.string().min(3, { message: t('validation.min').replace('{field}', t('account.username')).replace('{length}', '3') }),
  displayName: z.string().min(2, { message: t('validation.min').replace('{field}', t('account.displayName')).replace('{length}', '2') }),
  password: z.string().min(6, { message: t('validation.min').replace('{field}', t('account.password')).replace('{length}', '6') }),
  role: z.string().min(1, { message: t('validation.required').replace('{field}', t('account.role')) }),
});

type CreateAdminFormValues = z.infer<ReturnType<typeof getCreateAdminSchema>>;

interface CreateAdminFormProps {
    onAdminCreated: (admin: User) => void;
}

export function CreateAdminForm({ onAdminCreated }: CreateAdminFormProps) {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = getCreateAdminSchema(t);
  
  const adminRoles = useMemo(() => {
      return Object.keys(roleToServiceDepartmentMap).map(role => {
          const department = roleToServiceDepartmentMap[role as keyof typeof roleToServiceDepartmentMap];
          const departmentTranslations = t('serviceDepartment');
          const deptKey = Object.keys(departmentTranslations).find(key => departmentTranslations[key] === department);
          return {
              value: role,
              label: deptKey ? t(`serviceDepartment.${deptKey}`) : department
          }
      });
  }, [t]);

  const form = useForm<CreateAdminFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      displayName: '',
      password: '',
      role: '',
    },
  });

  async function onSubmit(values: CreateAdminFormValues) {
    setIsLoading(true);
    try {
      const newUser = await createUser({
          ...values,
          role: values.role as UserRole
      });
      toast({
        title: t('account.createAdminSuccessTitle'),
        description: t('account.createAdminSuccessDescription').replace('{username}', values.username),
      });
      onAdminCreated(newUser);
      form.reset();
    } catch (error) {
       toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.errorDescription'),
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.displayName')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('account.displayNamePlaceholder')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('login.username')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('login.usernamePlaceholder')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.password')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} placeholder="••••••••" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.role')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('account.rolePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {adminRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('account.createAdminButton')}
        </Button>
      </form>
    </Form>
  );
}
