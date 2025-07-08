'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStudentRegistrationSchema } from '@/lib/validations/student';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from './image-upload';
import { useRouter } from 'next/navigation';
import { mockStudents, roleToServiceDepartmentMap, UserRole, ServiceDepartment, Student } from '@/lib/mock-data';
import { useLocale } from '@/contexts/locale-provider';

type StudentFormValues = z.infer<ReturnType<typeof getStudentRegistrationSchema>>;

interface StudentRegistrationFormProps {
  studentToEdit?: Student;
}

export function StudentRegistrationForm({ studentToEdit }: StudentRegistrationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const router = useRouter();
  const isEditMode = !!studentToEdit;
  const { t, locale } = useLocale();

  const studentRegistrationSchema = useMemo(() => getStudentRegistrationSchema(t), [t]);
  
  const serviceDepartments: { value: ServiceDepartment; label: string }[] = useMemo(() => [
    { value: 'ቀዳማይ -1 ክፍል', label: t('serviceDepartment.children_1') },
    { value: 'ቀዳማይ -2 ክፍል', label: t('serviceDepartment.children_2') },
    { value: 'ካእላይ ክፍል', label: t('serviceDepartment.junior') },
    { value: 'ማእከላይ ክፍል', label: t('serviceDepartment.senior') },
  ], [t]);

  const genders = useMemo(() => [
    { value: 'ወንድ', label: t('validation.gender.male') },
    { value: 'ሴት', label: t('validation.gender.female') },
  ], [t]);

  useEffect(() => {
    const role = localStorage.getItem('user_role') as UserRole | null;
    setUserRole(role);
  }, []);

  const defaultServiceDepartment = userRole && userRole !== 'super_admin' ? roleToServiceDepartmentMap[userRole as Exclude<UserRole, 'super_admin'>] : '';

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
        photo: '',
        registrationNumber: '',
        fullName: '',
        gender: '',
        serviceDepartment: defaultServiceDepartment,
        baptismalName: '',
        mothersName: '',
        educationLevel: '',
        fathersPhoneNumber: '',
        mothersPhoneNumber: '',
        additionalPhoneNumber: '',
        phoneNumber: '',
        subcity: '',
        kebele: '',
        houseNumber: '',
        specificAddress: '',
        dateOfJoining: new Date(),
    },
  });

  useEffect(() => {
    if (studentToEdit) {
      form.reset({
        ...studentToEdit,
        dateOfBirth: studentToEdit.dateOfBirth ? new Date(studentToEdit.dateOfBirth) : undefined,
        dateOfJoining: studentToEdit.dateOfJoining ? new Date(studentToEdit.dateOfJoining) : undefined,
      });
    }
  }, [studentToEdit, form]);

  useEffect(() => {
    if (!isEditMode && userRole && userRole !== 'super_admin') {
      form.setValue('serviceDepartment', roleToServiceDepartmentMap[userRole as Exclude<UserRole, 'super_admin'>]);
    }
  }, [userRole, form, isEditMode]);

  async function onSubmit(data: StudentFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const currentStudents = JSON.parse(localStorage.getItem('students') || 'null') || mockStudents;

    if (isEditMode) {
      const index = currentStudents.findIndex((s: Student) => s.registrationNumber === studentToEdit.registrationNumber);
      if (index > -1) {
        currentStudents[index] = data;
      }
       toast({
        title: t('form.updateSuccess'),
        description: t('form.updateSuccessDescription').replace('{name}', data.fullName),
      });
    } else {
      currentStudents.unshift(data);
      toast({
        title: t('form.registerSuccess'),
        description: t('form.registerSuccessDescription').replace('{name}', data.fullName),
      });
    }
    
    localStorage.setItem('students', JSON.stringify(currentStudents));
    window.dispatchEvent(new Event('storage'));
    setIsLoading(false);
    router.push('/students');
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? t('form.editTitle') : t('form.title')}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <div className="space-y-6">
                <h3 className="text-lg font-medium">{t('form.photoSection')}</h3>
                <Separator />
                <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('form.photoLabel')}</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <div className="space-y-6">
                <h3 className="text-lg font-medium">{t('form.personalInfoSection')}</h3>
                <Separator />
                <div className="grid md:grid-cols-3 gap-6">
                <FormField control={form.control} name="registrationNumber" render={({ field }) => (
                    <FormItem><FormLabel>{t('form.label.regNumber')}</FormLabel><FormControl><Input placeholder={t('form.placeholder.regNumber')} {...field} readOnly={isEditMode} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>{t('form.label.fullName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('form.label.gender')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={t('form.placeholder.selectGender')} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {genders.map(gender => <SelectItem key={gender.value} value={gender.value}>{gender.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )} />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                <FormField control={form.control} name="baptismalName" render={({ field }) => (
                    <FormItem><FormLabel>{t('form.label.baptismalName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="mothersName" render={({ field }) => (
                    <FormItem><FormLabel>{t('form.label.mothersName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField
                    control={form.control}
                    name="serviceDepartment"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('form.label.department')}</FormLabel>
                        {userRole === 'super_admin' ? (
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('form.placeholder.selectDepartment')} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {serviceDepartments.map(dep => <SelectItem key={dep.value} value={dep.value}>{dep.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        ) : (
                           <FormControl>
                             <Input
                                readOnly
                                value={serviceDepartments.find(d => d.value === field.value)?.label || 'Loading...'}
                                className="bg-muted"
                             />
                           </FormControl>
                        )}
                        <FormMessage />
                        </FormItem>
                    )}
                />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>{t('form.label.dob')}</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? (format(field.value, "PPP")) : (<span>{t('form.pickDate')}</span>)}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1930-01-01")} initialFocus />
                            </PopoverContent>
                        </Popover><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="educationLevel" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('form.label.education')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('form.placeholder.education')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="dateOfJoining" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>{t('form.label.joinDate')}</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? (format(field.value, "PPP")) : (<span>{t('form.pickDate')}</span>)}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                            </PopoverContent>
                        </Popover><FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
            
            <div className="space-y-6">
                <h3 className="text-lg font-medium">{t('form.contactInfoSection')}</h3>
                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>{t('form.label.phone')}</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="additionalPhoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>{t('form.label.additionalPhone')}</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fathersPhoneNumber" render={({ field }) => (
                        <FormItem><FormLabel>{t('form.label.fathersPhone')}</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="mothersPhoneNumber" render={({ field }) => (
                        <FormItem><FormLabel>{t('form.label.mothersPhone')}</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-medium">{t('form.addressSection')}</h3>
                <Separator />
                <div className="grid md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="subcity" render={({ field }) => (
                        <FormItem><FormLabel>{t('form.label.subcity')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="kebele" render={({ field }) => (
                        <FormItem><FormLabel>{t('form.label.kebele')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="houseNumber" render={({ field }) => (
                        <FormItem><FormLabel>{t('form.label.houseNumber')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="specificAddress" render={({ field }) => (
                <FormItem><FormLabel>{t('form.label.specificAddress')}</FormLabel><FormControl><Textarea placeholder={t('form.placeholder.address')} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t('form.loading') : (isEditMode ? t('form.save') : t('form.submit'))}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
