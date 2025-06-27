'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { studentRegistrationSchema } from '@/lib/validations/student';
import { useRouter } from 'next/navigation';
import { mockStudents } from '@/lib/mock-data';

const bulkImportSchema = z.object({
  jsonData: z.string().min(1, { message: "JSON data cannot be empty." }),
});

type BulkImportFormValues = z.infer<typeof bulkImportSchema>;

const jsonExample = `[
  {
    "photo": "https://placehold.co/100x100.png",
    "registrationNumber": "S101",
    "fullName": "New Student One",
    "gender": "ወንድ",
    "serviceDepartment": "ቀዳማይ -1 ክፍል",
    "baptismalName": "Gebre Mariam",
    "mothersName": "Woizero Almaz",
    "dateOfBirth": "2012-05-20T00:00:00.000Z",
    "educationLevel": "5ኛ-8ኛ ክፍል",
    "fathersPhoneNumber": "0911000001",
    "mothersPhoneNumber": "0911000002",
    "additionalPhoneNumber": "",
    "phoneNumber": "0911000003",
    "subcity": "Gulele",
    "kebele": "01",
    "houseNumber": "111",
    "specificAddress": "Near the old post office",
    "dateOfJoining": "2024-01-01T00:00:00.000Z"
  }
]`;

export function BulkImportForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<BulkImportFormValues>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: {
      jsonData: '',
    },
  });

  async function onSubmit(data: BulkImportFormValues) {
    setIsLoading(true);
    
    let importedCount = 0;
    let errorCount = 0;

    try {
      const parsedData = JSON.parse(data.jsonData);
      if (!Array.isArray(parsedData)) {
        throw new Error("The provided data is not a JSON array.");
      }

      const validationSchema = z.array(studentRegistrationSchema);
      const validationResult = validationSchema.safeParse(parsedData);
      
      if (validationResult.success) {
        // All students are valid
        validationResult.data.forEach(student => {
          mockStudents.unshift(student);
          importedCount++;
        });
      } else {
        // Some students might be invalid, process them one by one
        parsedData.forEach(item => {
          const studentResult = studentRegistrationSchema.safeParse(item);
          if (studentResult.success) {
            mockStudents.unshift(studentResult.data);
            importedCount++;
          } else {
            errorCount++;
            console.error("Invalid student data:", item, studentResult.error.flatten());
          }
        });
      }

      toast({
        title: 'Import Complete',
        description: `${importedCount} students imported successfully. ${errorCount > 0 ? `${errorCount} records failed.` : ''}`,
      });

      if (importedCount > 0) {
        setTimeout(() => router.push('/students'), 1000);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: 'Import Failed',
        description: `Invalid JSON format. Please check your data and try again. Details: ${errorMessage}`,
      });
      console.error(error);
    }
    
    setIsLoading(false);
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Paste Student Data</CardTitle>
        <CardDescription>
          Provide an array of student objects in JSON format. Use an online tool to convert your Excel file to JSON.
          Ensure `dateOfBirth` and `dateOfJoining` are in ISO format (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ").
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="jsonData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student JSON Data</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your JSON array here..."
                      className="min-h-[250px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <h4 className="font-medium mb-2">Example Format</h4>
              <div className="p-4 bg-muted rounded-md overflow-x-auto">
                <pre className="text-xs text-muted-foreground">{jsonExample}</pre>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Students
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
