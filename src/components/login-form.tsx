
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User } from 'lucide-react';
import { useLocale } from '@/contexts/locale-provider';
import { signIn } from '@/lib/auth';
import { PasswordInput } from './password-input';

const getFormSchema = (t: (key: string) => string) => z.object({
  username: z.string().min(1, { message: t('validation.required').replace('{field}', t('login.username')) }),
  password: z.string().min(1, { message: t('validation.required').replace('{field}', t('login.password')) }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocale();

  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const result = await signIn(values);

    if (result.success && result.user) {
      localStorage.setItem('userId', result.user.id)
      localStorage.setItem('username', result.user.username);
      localStorage.setItem('displayName', result.user.displayName);
      localStorage.setItem('user_role', JSON.stringify(result.user.role));
      
      toast({
        title: t('login.success'),
        description: t('login.successDescription').replace('{username}', result.user.displayName || ''),
      });
      router.push('/dashboard');
      router.refresh();
    } else {
      toast({
          variant: "destructive",
          title: t('login.fail'),
          description: result.error || t('login.failDescription'),
      });
    }
    
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('login.username')}</FormLabel>
               <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input placeholder={t('login.usernamePlaceholder')} {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('login.password')}</FormLabel>
               <PasswordInput field={field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? t('login.loadingButton') : t('login.button')}
        </Button>
      </form>
    </Form>
  );
}
