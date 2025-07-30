'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStudentRegistrationSchema } from '@/lib/validations/student';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from './image-upload';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/contexts/locale-provider';
import { Student } from '@prisma/client';
import { createStudent, updateStudent } from '@/lib/data';
import { roleToServiceDepartmentMap, ServiceDepartment, UserRole } from '@/lib/auth';

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
  const { t } = useLocale();
  
  const amharicMonths = useMemo(() => [
    'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
  ], []);
  
  const [joinDay, setJoinDay] = useState('');
  const [joinMonth, setJoinMonth] = useState('');
  const [joinYear, setJoinYear] = useState('');

  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  const studentRegistrationSchema = useMemo(() => getStudentRegistrationSchema(t), [t]);
  
  const serviceDepartments: { value: ServiceDepartment; label: string }[] = useMemo(() => [
    { value: 'ቀዳማይ -1 ክፍል', label: t('serviceDepartment.children_1') },
    { value: 'ቀዳማይ -2 ክፍል', label: t('serviceDepartment.children_2') },
    { value: 'ካእላይ ክፍል', label: t('serviceDepartment.junior') },
    { value: 'ማእከላይ ክፍል', label: t('serviceDepartment.senior') },
    { value: 'የወጣት ክፍል', label: t('serviceDepartment.youth') },
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

  const defaultFormValues = useMemo(() => ({
    photo: '',
    registrationNumber: '',
    fullName: '',
    gender: '',
    serviceDepartment: defaultServiceDepartment,
    baptismalName: '',
    mothersName: '',
    dateOfBirth: '',
    educationLevel: '',
    fathersPhoneNumber: '',
    mothersPhoneNumber: '',
    additionalPhoneNumber: '',
    phoneNumber: '',
    subcity: '',
    kebele: '',
    houseNumber: '',
    specificAddress: '',
    dateOfJoining: '',
  }), [defaultServiceDepartment]);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (studentToEdit) {
      const valuesToReset: any = {
        ...studentToEdit,
        photo: studentToEdit.photo || '',
        baptismalName: studentToEdit.baptismalName || '',
        mothersName: studentToEdit.mothersName || '',
        dateOfBirth: studentToEdit.dateOfBirth || '',
        educationLevel: studentToEdit.educationLevel || '',
        fathersPhoneNumber: studentToEdit.fathersPhoneNumber || '',
        mothersPhoneNumber: studentToEdit.mothersPhoneNumber || '',
        additionalPhoneNumber: studentToEdit.additionalPhoneNumber || '',
        subcity: studentToEdit.subcity || '',
        kebele: studentToEdit.kebele || '',
        houseNumber: studentToEdit.houseNumber || '',
        specificAddress: studentToEdit.specificAddress || '',
        dateOfJoining: studentToEdit.dateOfJoining || '',
      };
      form.reset(valuesToReset);
      if (studentToEdit.dateOfJoining) {
          const parts = studentToEdit.dateOfJoining.split(' ');
          if (parts.length === 3) {
              setJoinDay(parts[0]);
              setJoinMonth(parts[1]);
              setJoinYear(parts[2]);
          }
      } else {
        setJoinDay('');
        setJoinMonth('');
        setJoinYear('');
      }
      if (studentToEdit.dateOfBirth) {
          const parts = studentToEdit.dateOfBirth.split(' ');
          if (parts.length === 3) {
              setBirthDay(parts[0]);
              setBirthMonth(parts[1]);
              setBirthYear(parts[2]);
          }
      } else {
        setBirthDay('');
        setBirthMonth('');
        setBirthYear('');
      }
    } else {
      form.reset(defaultFormValues);
      setJoinDay('');
      setJoinMonth('');
      setJoinYear('');
      setBirthDay('');
      setBirthMonth('');
      setBirthYear('');
    }
  }, [studentToEdit, form, defaultFormValues]);

  useEffect(() => {
    if (joinDay || joinMonth || joinYear) {
      const fullDate = `${joinDay || ''} ${joinMonth || ''} ${joinYear || ''}`.trim();
      form.setValue('dateOfJoining', fullDate || undefined, { shouldValidate: true });
    } else {
      form.setValue('dateOfJoining', undefined, { shouldValidate: true });
    }
  }, [joinDay, joinMonth, joinYear, form]);

  useEffect(() => {
    if (birthDay || birthMonth || birthYear) {
      const fullDate = `${birthDay || ''} ${birthMonth || ''} ${birthYear || ''}`.trim();
      form.setValue('dateOfBirth', fullDate || undefined, { shouldValidate: true });
    } else {
      form.setValue('dateOfBirth', undefined, { shouldValidate: true });
    }
  }, [birthDay, birthMonth, birthYear, form]);

  useEffect(() => {
    if (!isEditMode && userRole && userRole !== 'super_admin') {
      form.setValue('serviceDepartment', roleToServiceDepartmentMap[userRole as Exclude<UserRole, 'super_admin'>]);
    }
  }, [userRole, form, isEditMode]);

  async function onSubmit(data: StudentFormValues) {
    setIsLoading(true);
    
    try {
      if (isEditMode) {
        await updateStudent(studentToEdit.id, data);
        toast({
          title: t('form.updateSuccess'),
          description: t('form.updateSuccessDescription').replace('{name}', data.fullName),
        });
      } else {
        await createStudent(data);
        toast({
          title: t('form.registerSuccess'),
          description: t('form.registerSuccessDescription').replace('{name}', data.fullName),
        });
      }
      router.push('/students');
      router.refresh();
    } catch (error) {
       toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.errorDescription'),
      });
    } finally {
      setIsLoading(false);
    }
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
                                    value={field.value ?? undefined}
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
                    <FormItem><FormLabel>{t('form.label.baptismalName')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="mothersName" render={({ field }) => (
                    <FormItem><FormLabel>{t('form.label.mothersName')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
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
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                          <FormItem className="flex flex-col">
                              <FormLabel>{t('form.label.dob')}</FormLabel>
                              <FormControl>
                                  <Input type="hidden" {...field} />
                              </FormControl>
                              <div className="grid grid-cols-3 gap-2 items-start">
                                  <Input
                                      id="birthDay"
                                      type="number"
                                      placeholder={t('form.placeholder.day')}
                                      value={birthDay}
                                      onChange={(e) => setBirthDay(e.target.value)}
                                      min="1" max="30"
                                  />
                                  <Select value={birthMonth} onValueChange={setBirthMonth}>
                                      <SelectTrigger id="birthMonth">
                                      <SelectValue placeholder={t('form.placeholder.month')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                          {amharicMonths.map(month => <SelectItem key={month} value={month}>{month}</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                                  <Input
                                      id="birthYear"
                                      type="number"
                                      placeholder={t('form.placeholder.year')}
                                      value={birthYear}
                                      onChange={(e) => setBirthYear(e.target.value)}
                                  />
                              </div>
                              <FormMessage />
                          </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="educationLevel" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('form.label.education')}</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField
                        control={form.control}
                        name="dateOfJoining"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>{t('form.label.joinDate')}</FormLabel>
                                <FormControl>
                                    <Input type="hidden" {...field} />
                                </FormControl>
                                <div className="grid grid-cols-3 gap-2 items-start">
                                    <Input
                                        id="joinDay"
                                        type="number"
                                        placeholder={t('form.placeholder.day')}
                                        value={joinDay}
                                        onChange={(e) => setJoinDay(e.target.value)}
                                        min="1" max="30"
                                    />
                                    <Select value={joinMonth} onValueChange={setJoinMonth}>
                                        <SelectTrigger id="joinMonth">
                                        <SelectValue placeholder={t('form.placeholder.month')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {amharicMonths.map(month => <SelectItem key={month} value={month}>{month}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        id="joinYear"
                                        type="number"
                                        placeholder={t('form.placeholder.year')}
                                        value={joinYear}
                                        onChange={(e) => setJoinYear(e.target.value)}
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                    <FormItem><FormLabel>{t('form.label.additionalPhone')}</FormLabel><FormControl><Input type="tel" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fathersPhoneNumber" render={({ field }) => (
                        <FormItem><FormLabel>{t('form.label.fathersPhone')}</FormLabel><FormControl><Input type="tel" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="mothersPhoneNumber" render={({ field }) => (
                        <FormItem><FormLabel>{t('form.label.mothersPhone')}</FormLabel><FormControl><Input type="tel" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-medium">{t('form.addressSection')}</h3>
                <Separator />
                <div className="grid md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="subcity" render={({ field }) => (
                        <FormItem><FormLabel>{t('form.label.subcity')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="kebele" render={({ field }) => (
                        <FormItem><FormLabel>{t('form.label.kebele')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="houseNumber" render={({ field }) => (
                        <FormItem><FormLabel>{t('form.label.houseNumber')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="specificAddress" render={({ field }) => (
                <FormItem><FormLabel>{t('form.label.specificAddress')}</FormLabel><FormControl><Textarea placeholder={t('form.placeholder.address')} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
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
