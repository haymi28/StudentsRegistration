'use client';

import { useEffect, useState } from 'react';
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
import { studentRegistrationSchema } from '@/lib/validations/student';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from './image-upload';
import { useRouter } from 'next/navigation';
import { mockStudents, roleToServiceDepartmentMap, UserRole, ServiceDepartment } from '@/lib/mock-data';

type StudentFormValues = z.infer<typeof studentRegistrationSchema>;

const educationLevels = ['ከKG በታች', 'KG 1-3', '1ኛ-4ኛ ክፍል', '5ኛ-8ኛ ክፍል', '9ኛ-10ኛ ክፍል', '11ኛ-12ኛ ክፍል', 'TVET', 'ዲፕሎማ', 'ዲግሪ', 'ማስተርስ', 'ፒኤችዲ', 'ሌላ'];
const genders = ['ወንድ', 'ሴት'];
const serviceDepartments: ServiceDepartment[] = ['Children', 'Children-2', 'Junior', 'Senior'];

export function StudentRegistrationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const router = useRouter();

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
        formCompletionDate: new Date(),
    },
  });

  useEffect(() => {
    if (userRole && userRole !== 'super_admin') {
      form.setValue('serviceDepartment', roleToServiceDepartmentMap[userRole as Exclude<UserRole, 'super_admin'>]);
    }
  }, [userRole, form]);

  async function onSubmit(data: StudentFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    mockStudents.unshift(data);
    
    console.log(data);
    
    toast({
      title: 'Registration Successful',
      description: `Student ${data.fullName} has been registered. Redirecting...`,
    });
    
    form.reset({
      ...form.getValues(),
      photo: '',
      registrationNumber: '',
      fullName: '',
      baptismalName: '',
      mothersName: '',
      fathersPhoneNumber: '',
      mothersPhoneNumber: '',
      additionalPhoneNumber: '',
      phoneNumber: '',
      subcity: '',
      kebele: '',
      houseNumber: '',
      specificAddress: '',
    });
    setIsLoading(false);

    router.push('/students');
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">የተማሪ መረጃ</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <div className="space-y-6">
                <h3 className="text-lg font-medium">Student Photo</h3>
                <Separator />
                <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Photo</FormLabel>
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
                <h3 className="text-lg font-medium">Personal Information</h3>
                <Separator />
                <div className="grid md:grid-cols-3 gap-6">
                <FormField control={form.control} name="registrationNumber" render={({ field }) => (
                    <FormItem><FormLabel>ቁጥር</FormLabel><FormControl><Input placeholder="Enter registration number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>ሙሉ ስም</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                    <FormLabel>ጾታ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {genders.map(gender => <SelectItem key={gender} value={gender}>{gender}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )} />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                <FormField control={form.control} name="baptismalName" render={({ field }) => (
                    <FormItem><FormLabel>የክርስትና ስም</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="mothersName" render={({ field }) => (
                    <FormItem><FormLabel>የእናት ስም</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField
                    control={form.control}
                    name="serviceDepartment"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>የአገልግሎት ክፍል</FormLabel>
                        {userRole === 'super_admin' ? (
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Service Department" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {serviceDepartments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        ) : (
                           <FormControl>
                             <Input
                                readOnly
                                value={field.value || 'Loading...'}
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
                        <FormItem className="flex flex-col"><FormLabel>የትውልድ ቀን</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
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
                        <FormLabel>የትምህርት ደረጃ</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Education Level" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {educationLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
            
            <div className="space-y-6">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>ስልክ ቁጥር</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="additionalPhoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>ተጨማሪ ስልክ</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fathersPhoneNumber" render={({ field }) => (
                        <FormItem><FormLabel>የአባት ስልክ ቁጥር</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="mothersPhoneNumber" render={({ field }) => (
                        <FormItem><FormLabel>የእናት ስልክ ቁጥር</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-medium">Address</h3>
                <Separator />
                <div className="grid md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="subcity" render={({ field }) => (
                        <FormItem><FormLabel>ክፍለ ከተማ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="kebele" render={({ field }) => (
                        <FormItem><FormLabel>ቀበሌ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="houseNumber" render={({ field }) => (
                        <FormItem><FormLabel>የቤት ቁጥር</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="specificAddress" render={({ field }) => (
                <FormItem><FormLabel>የቤት ልዩ አድራሻ</FormLabel><FormControl><Textarea placeholder="Detailed address information..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            <FormField control={form.control} name="formCompletionDate" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>ቅፁ የተሞላበት ቀን</FormLabel>
                  <Popover><PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover><FormMessage />
                </FormItem>
              )} />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Registration
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
