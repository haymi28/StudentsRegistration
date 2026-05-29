
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Copy, Check, Eye, EyeOff, RefreshCw, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { User, Role } from '@prisma/client';
import { getCreateUserSchema, getUpdateUserSchema } from '@/lib/validations/user';
import { createUser, updateUser, getRoles } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { PasswordInput } from './password-input';
import { generateSecureRandomString } from '@/lib/crypto';

type UserFormValues = z.infer<ReturnType<typeof getCreateUserSchema>>;

interface UserFormProps {
  userToEdit?: User & { role: Role };
}

export function UserForm({ userToEdit }: UserFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const isEditMode = !!userToEdit;
  const { t } = useLocale();

  const translations = useMemo(() => ({
    title: isEditMode ? t('users.form.editTitle') : t('users.form.createTitle'),
    description: isEditMode ? t('users.form.editDescription') : t('users.form.createDescription'),
    labels: {
        displayName: t('users.form.label.displayName'),
        username: t('users.form.label.username'),
        password: t('users.form.label.password'),
        role: t('users.form.label.role'),
        status: t('users.form.label.status'),
        active: t('users.form.label.active'),
        inactive: t('users.form.label.inactive'),
    },
    placeholders: {
        selectRole: t('users.form.placeholder.selectRole'),
        password: t('users.form.placeholder.passwordOptional')
    },
    buttons: {
        submit: isEditMode ? t('form.save') : t('form.submit'),
        loading: t('form.loading'),
    },
    success: {
        title: isEditMode ? t('users.form.updateSuccess.title') : t('users.form.createSuccess.title'),
        description: isEditMode ? t('users.form.updateSuccess.description') : t('users.form.createSuccess.description'),
    }
  }), [t, isEditMode]);

  useEffect(() => {
    getRoles().then(setRoles);
  }, []);

  const validationSchema = useMemo(() => {
    return isEditMode ? getUpdateUserSchema(t) : getCreateUserSchema(t);
  }, [isEditMode, t]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: isEditMode
      ? {
          displayName: userToEdit.displayName,
          username: userToEdit.username,
          roleId: userToEdit.roleId,
          isActive: userToEdit.isActive,
          password: '',
        }
      : {
          displayName: '',
          username: '',
          roleId: undefined,
          isActive: true,
          password: '',
        },
  });

  async function onSubmit(data: UserFormValues) {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await updateUser(userToEdit.id, data);
        toast({
            title: translations.success.title,
            description: translations.success.description.replace('{username}', data.username)
        });
        router.push('/users');
        router.refresh();
      } else {
        const result = await createUser(data);
        setTempPassword(result.tempPassword);
        toast({
            title: translations.success.title,
            description: translations.success.description.replace('{username}', data.username)
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isSuperAdminRole = userToEdit?.role.name === 'Super Admin';

  const generateRandomPassword = () => {
    const newPass = generateSecureRandomString(10);
    form.setValue('password', newPass);
    setShowPassword(true);
    toast({
      title: t('common.generate'),
      description: t('users.form.passwordGenerated'),
    });
  };

  const copyToClipboard = (text?: string) => {
    const textToCopy = text || form.getValues('password');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: t('common.copied'),
        description: t('users.form.passwordCopied'),
      });
    }
  };

  if (tempPassword) {
    return (
      <Card className="w-full shadow-lg border-primary">
        <CardHeader>
          <CardTitle className="text-primary">{t('users.form.tempPasswordTitle')}</CardTitle>
          <CardDescription>
            {t('users.form.tempPasswordDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-muted rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-4">
            <div className="text-sm font-medium text-muted-foreground">{t('users.form.label.password')}</div>
            <div className="flex items-center gap-4">
                <span className="text-3xl font-mono font-bold tracking-wider">
                  {showPassword ? tempPassword : '••••••••••'}
                </span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? t('common.hide') : t('common.show')}
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={copyToClipboard} variant="outline" className="gap-2">
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {isCopied ? t('common.copied') : t('common.copy')}
            </Button>
            <Button onClick={() => {
                router.push('/users');
                router.refresh();
            }}>
              {t('common.done')}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 text-xs text-muted-foreground flex justify-center py-3">
            {t('users.form.tempPasswordNotice')}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField control={form.control} name="displayName" render={({ field }) => (
                <FormItem><FormLabel>{translations.labels.displayName}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>{translations.labels.username}</FormLabel><FormControl><Input {...field} readOnly={isEditMode} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="space-y-4">
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{translations.labels.password}</FormLabel>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2">
                                <FormControl>
                                    <div className="relative flex-1">
                                        <Input 
                                            {...field} 
                                            type={showPassword ? "text" : "password"} 
                                            placeholder={isEditMode ? translations.placeholders.password : '••••••••'} 
                                            className="pr-10 font-mono"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                        </Button>
                                    </div>
                                </FormControl>
                                {!isEditMode && (
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={generateRandomPassword}
                                        className="gap-2 shrink-0"
                                    >
                                        {field.value ? <RefreshCw className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
                                        {field.value ? t('common.regenerate') : t('common.generate')}
                                    </Button>
                                )}
                                {field.value && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => copyToClipboard(field.value)}
                                        className="shrink-0"
                                        title={t('common.copy')}
                                    >
                                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
                            {isEditMode && <FormDescription>{translations.placeholders.password}</FormDescription>}
                            {!isEditMode && !field.value && <FormDescription>Enter a password or use the generator to create a secure temporary one.</FormDescription>}
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="roleId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{translations.labels.role}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSuperAdminRole}>
                            <FormControl><SelectTrigger><SelectValue placeholder={translations.placeholders.selectRole} /></SelectTrigger></FormControl>
                            <SelectContent>
                                {roles.map(role => <SelectItem key={role.id} value={role.id} disabled={role.name === 'Super Admin'}>{role.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-8">
                            <div className="space-y-0.5">
                                <FormLabel>{translations.labels.status}</FormLabel>
                                <FormDescription>{field.value ? translations.labels.active : translations.labels.inactive}</FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isSuperAdminRole}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? translations.buttons.loading : (isEditMode ? translations.buttons.submit : translations.buttons.submit)}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
