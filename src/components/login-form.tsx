
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { useLocale } from '@/contexts/locale-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signIn } from '@/lib/auth';
import { getUsers } from '@/lib/data';
import { User } from '@prisma/client';

const getFormSchema = (t: (key: string) => string) => z.object({
  username: z.string({ required_error: t('validation.required').replace('{field}', t('login.username')) }),
  password: z.string().min(6, { message: t('validation.min').replace('{field}', t('login.password')).replace('{length}', '6') }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLocale();
  const [users, setUsers] = useState<User[]>([]);

  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users", error);
        toast({
            variant: "destructive",
            title: t('common.error'),
            description: t('common.errorDescription'),
        });
      }
    }
    fetchUsers();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const result = await signIn(values);

    if (result.success) {
      toast({
        title: t('login.success'),
        description: t('login.successDescription').replace('{username}', result.user?.displayName || ''),
      });
      window.dispatchEvent(new Event("storage")); // Manually trigger storage event
      router.push('/students');
      router.refresh(); // Important to re-fetch server components
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('login.usernamePlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map(user => (
                        <SelectItem key={user.id} value={user.username}>{user.displayName}</SelectItem>
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
               <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
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
