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
import { mockUsers, User } from '@/lib/mock-data';
import { useLocale } from '@/contexts/locale-provider';
import { getUpdateProfileSchema } from '@/lib/validations/user';

type ProfileFormValues = z.infer<ReturnType<typeof getUpdateProfileSchema>>;

export function UpdateProfileForm() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const formSchema = getUpdateProfileSchema(t);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      displayName: '',
    },
  });

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      const storedUsers = JSON.parse(localStorage.getItem('users') || 'null') || mockUsers;
      const user = storedUsers.find((u: User) => u.username === username);
      if (user) {
        setCurrentUser(user);
        form.reset({
          username: user.username,
          displayName: user.displayName,
        });
      }
    }
  }, [form]);

  async function onSubmit(values: ProfileFormValues) {
    if (!currentUser) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || 'null') || mockUsers;
      const userIndex = storedUsers.findIndex(u => u.username === currentUser.username);

      if (userIndex > -1) {
        storedUsers[userIndex].displayName = values.displayName;
        localStorage.setItem('users', JSON.stringify(storedUsers));
        
        toast({
          title: t('account.updateProfileSuccessTitle'),
          description: t('account.updateProfileSuccessDescription'),
        });
      } else {
         throw new Error('User not found');
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('common.errorDescription'),
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
