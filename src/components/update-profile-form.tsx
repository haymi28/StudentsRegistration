
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/contexts/locale-provider';
import { getUserByUsername, updateUser } from '@/lib/data';
import { User } from '@prisma/client';
import { getUpdateProfileSchema } from '@/lib/validations/user';
import { signIn } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { getUserFacingErrorMessage } from '@/lib/errors';

type ProfileFormValues = z.infer<ReturnType<typeof getUpdateProfileSchema>>;

export function UpdateProfileForm() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  const formSchema = useMemo(() => getUpdateProfileSchema(t), [t]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      displayName: '',
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = await getUserByUsername(username);
                if (user) {
                    setCurrentUser(user);
                    form.reset({
                        username: user.username,
                        displayName: user.displayName,
                    });
                }
            } catch(e) {
                // To prevent app crash on first load if db is not ready
            }
        }
    };
    fetchUser();
  }, [form]);

  async function onSubmit(values: ProfileFormValues) {
    if (!currentUser) return;
    setIsLoading(true);
    
    try {
        await updateUser(currentUser.id, { 
            displayName: values.displayName,
            username: values.username,
        });

        const usernameChanged = currentUser.username !== values.username;
        
        toast({
          title: t('account.updateProfileSuccessTitle'),
          description: t('account.updateProfileSuccessDescription'),
        });

        if (usernameChanged) {
            const result = await signIn({ username: values.username, password: '' }, true);
            if (result.success && result.user) {
                localStorage.setItem('userId', result.user.id);
                localStorage.setItem('username', result.user.username);
                localStorage.setItem('displayName', result.user.displayName);
                localStorage.setItem('user_role', JSON.stringify(result.user.role));
                router.refresh();
            } else {
                 toast({ variant: 'destructive', title: t('account.sessionUpdateFailed'), description: t('account.reloginDescription')});
            }
        } else {
            localStorage.setItem('displayName', values.displayName);
        }

    } catch (error) {
       toast({
        variant: 'destructive',
        title: t('common.error'),
        description: getUserFacingErrorMessage(error, t),
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
                <Input {...field} placeholder={t('login.usernamePlaceholder')} />
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
