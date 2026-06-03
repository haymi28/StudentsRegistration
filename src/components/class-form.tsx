
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useRouter } from 'next/navigation';
import { User, Class } from '@prisma/client';
import { getCreateClassSchema } from '@/lib/validations/class';
import { createClass, updateClass } from '@/lib/data';
import { useState } from 'react';
import { useLocale } from '@/contexts/locale-provider';
import { getUserFacingErrorMessage } from '@/lib/errors';

type ClassFormValues = z.infer<ReturnType<typeof getCreateClassSchema>>;

interface ClassFormProps {
  classToEdit?: Class;
  users: User[];
}

export function ClassForm({ classToEdit, users }: ClassFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isEditMode = !!classToEdit;
  const { t } = useLocale();

  const translations = {
    labels: {
        name: t('classes.form.label.name'),
        manager: t('classes.form.label.manager'),
    },
    placeholders: {
        name: t('classes.form.placeholder.name'),
        manager: t('classes.form.placeholder.manager'),
    },
    buttons: {
        submit: isEditMode ? t('form.save') : t('form.submit'),
        loading: t('form.loading'),
    },
    success: {
        title: isEditMode ? t('classes.form.updateSuccess.title') : t('classes.form.createSuccess.title'),
        description: isEditMode ? t('classes.form.updateSuccess.description') : t('classes.form.createSuccess.description'),
    },
  };

  const validationSchema = getCreateClassSchema(t);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: isEditMode
      ? {
          name: classToEdit.name,
          managerId: classToEdit.managerId || undefined,
        }
      : {
          name: '',
          managerId: undefined,
        },
  });

  async function onSubmit(data: ClassFormValues) {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await updateClass(classToEdit.id, data);
        toast({
          title: translations.success.title,
          description: translations.success.description.replace('{name}', data.name),
        });
      } else {
        await createClass(data);
        toast({
          title: translations.success.title,
          description: translations.success.description.replace('{name}', data.name),
        });
      }
      router.push('/classes');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: getUserFacingErrorMessage(error, t),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.labels.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={translations.placeholders.name} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.labels.manager}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={translations.placeholders.manager} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.displayName} ({user.username})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? translations.buttons.loading : translations.buttons.submit}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
