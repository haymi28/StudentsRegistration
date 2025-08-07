'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
import { useLocale } from '@/contexts/locale-provider';
import { useAuth } from '@/contexts/auth-provider';
import { useRouter } from 'next/navigation';

const getLoginFormSchema = (t: (key: string) => string) => z.object({
  username: z.string().min(1, { message: t('validation.required').replace('{field}', t('login.username')) }),
  password: z.string().min(1, { message: t('validation.required').replace('{field}', t('login.password')) }),
});

type LoginFormValues = z.infer<ReturnType<typeof getLoginFormSchema>>;

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

export default function LoginPage() {
  const { toast } = useToast();
  const { t } = useLocale();
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = getLoginFormSchema(t);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        toast({
          title: t('login.success'),
          description: t('login.successDescription').replace('{username}', values.username),
        });
        router.push('/students');
      } else {
        throw new Error(t('login.failDescription'));
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: t('login.fail'),
        description: error instanceof Error ? error.message : t('common.errorDescription'),
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
                <CardDescription>{t('login.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('login.username')}</FormLabel>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                                <Input placeholder={t('login.usernamePlaceholder')} {...field} className="pl-10"/>
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
                        <PasswordInput field={field} placeholder="••••••••" t={t} />
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? t('login.loadingButton') : t('login.button')}
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}