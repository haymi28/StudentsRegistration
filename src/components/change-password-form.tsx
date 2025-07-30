'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { useLocale } from '@/contexts/locale-provider';
import { getChangePasswordSchema } from '@/lib/validations/user';
import { getUserByUsername, updateUser } from '@/lib/data';

type PasswordFormValues = z.infer<ReturnType<typeof getChangePasswordSchema>>;

const PasswordInput = ({ field, placeholder, t }: { field: any, placeholder: string, t: (key: string) => string }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <FormControl>
        <Input 
          type={showPassword ? "text" : "password"} 
          placeholder={placeholder} 
          {...field} 
          className="pl-10 pr-10" 
        />
      </FormControl>
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
        aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}


export function ChangePasswordForm() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = getChangePasswordSchema(t);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: PasswordFormValues) {
    setIsLoading(true);
    
    const username = localStorage.getItem('username');

    if (!username) {
        toast({ variant: 'destructive', title: t('common.error'), description: t('common.userNotFound') });
        setIsLoading(false);
        return;
    }
    
    try {
      const user = await getUserByUsername(username);

      if (!user) {
          throw new Error('User not found in storage');
      }
      
      if (user.password !== values.currentPassword) {
          form.setError('currentPassword', { type: 'manual', message: t('validation.currentPasswordIncorrect') });
          setIsLoading(false);
          return;
      }
      
      await updateUser(user.id, { password: values.newPassword });
      
      toast({
        title: t('account.changePasswordSuccessTitle'),
        description: t('account.changePasswordSuccessDescription'),
      });
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.currentPassword')}</FormLabel>
              <PasswordInput field={field} placeholder="••••••••" t={t} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.newPassword')}</FormLabel>
              <PasswordInput field={field} placeholder="••••••••" t={t} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.confirmPassword')}</FormLabel>
               <PasswordInput field={field} placeholder="••••••••" t={t} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('account.changePasswordButton')}
        </Button>
      </form>
    </Form>
  );
}
