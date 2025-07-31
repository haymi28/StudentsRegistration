'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/contexts/locale-provider';
import { getUpdateProfileSchema } from '@/lib/validations/user';
import { updateUser } from '@/lib/data';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';

type ProfileFormValues = z.infer<ReturnType<typeof getUpdateProfileSchema>>;

export function UpdateProfileForm() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, update } = useSession();

  const formSchema = getUpdateProfileSchema(t);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      displayName: '',
    },
  });

  useEffect(() => {
    if (session?.user) {
        form.reset({
            username: session.user.name ?? '',
            displayName: session.user.displayName ?? '',
        });
    }
  }, [form, session]);

  async function onSubmit(values: ProfileFormValues) {
    if (!session?.user.id) return;
    setIsLoading(true);
    
    try {
        await updateUser(session.user.id, { displayName: values.displayName });
        
        // This updates the session on the client
        await update({ displayName: values.displayName });
        
        toast({
          title: t('account.updateProfileSuccessTitle'),
          description: t('account.updateProfileSuccessDescription'),
        });
        
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('login.username')}</FormLabel>
              <FormControl>
                <Input {...field} readOnly disabled className="bg-muted" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('form.save')}
        </Button>
      </form>
    </Form>
  );
}
