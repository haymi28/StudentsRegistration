'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { useLocale } from '@/contexts/locale-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const getFormSchema = (t: (key: string) => string) => z.object({
  username: z.string({ required_error: t('validation.required').replace('{field}', t('login.username')) }),
  password: z.string().min(6, { message: t('validation.min').replace('{field}', t('login.password')).replace('{length}', '6') }),
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { username, password } = values;
    const user = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (user) {
        localStorage.setItem('auth_token', `mock_token_for_${user.username}`);
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('username', user.username);
        window.dispatchEvent(new Event("storage"));
        
        toast({
          title: t('login.success'),
          description: t('login.successDescription').replace('{username}', user.username),
        });

        router.push('/students');
        router.refresh();
    } else {
        toast({
            variant: "destructive",
            title: t('login.fail'),
            description: t('login.failDescription'),
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('login.usernamePlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockUsers.map(user => (
                        <SelectItem key={user.username} value={user.username}>{user.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
               <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                </FormControl>
              </div>
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
