
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/contexts/locale-provider';
import { getChangePasswordSchema } from '@/lib/validations/user';
import { changeUserPassword } from '@/lib/data';
import { PasswordInput } from './password-input';

import { extractAppError, getUserFacingErrorMessage } from '@/lib/errors';
import { refreshSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';


type PasswordFormValues = z.infer<ReturnType<typeof getChangePasswordSchema>>;

export function ChangePasswordForm() {
  const { toast } = useToast();
  const { t } = useLocale();
  const router = useRouter();
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
    
    try {
      await changeUserPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      // Refresh session to update requiresPasswordChange in JWT
      const result = await refreshSession();
      
      toast({
        title: t('account.changePasswordSuccessTitle'),
        description: t('account.changePasswordSuccessDescription'),
      });
      form.reset();

      // Redirect to the first accessible page
      if (result?.landingPage) {
        router.push(result.landingPage);
        router.refresh();
      }

    } catch (error) {
      const appError = extractAppError(error);
      if (appError?.code === 'unauthorized' || (error instanceof Error && error.message.includes('password'))) {
        form.setError('currentPassword', { type: 'manual', message: t('validation.currentPasswordIncorrect') });
      } else {
        toast({
          variant: 'destructive',
          title: t('common.error'),
          description: getUserFacingErrorMessage(error, t),
        });
      }

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
              <PasswordInput field={field} />
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
              <PasswordInput field={field} />
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
              <PasswordInput field={field} />
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
