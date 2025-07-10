
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, Download, Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/contexts/locale-provider';
import { mockStudents, Student } from '@/lib/mock-data';
import { readExcelFile, downloadTemplate, studentHeaders } from '@/lib/excel-utils';
import { getStudentRegistrationSchema } from '@/lib/validations/student';

const formSchema = z.object({
  file: z.instanceof(File).refine(file => file.size > 0, 'File is required.'),
});

type ValidationResult = {
  validStudents: Student[];
  errors: { row: number; messages: string[] }[];
};

export function BulkImportForm() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocale();
  const { toast } = useToast();
  const studentValidationSchema = getStudentRegistrationSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    form.setValue('file', file);
    setIsLoading(true);
    setValidationResult(null);

    try {
      const studentsFromFile = await readExcelFile(file, t);
      const currentStudents = JSON.parse(localStorage.getItem('students') || 'null') || mockStudents;
      const existingRegNumbers = new Set(currentStudents.map((s: Student) => s.registrationNumber));

      const validationPromises = studentsFromFile.map((student, index) => {
        const result = studentValidationSchema.safeParse(student);
        const errors: string[] = [];
        if (!result.success) {
          errors.push(...result.error.errors.map(e => `${studentHeaders(t).find(h => h.key === e.path[0])?.label || e.path[0]}: ${e.message}`));
        }
        if (existingRegNumbers.has(student.registrationNumber)) {
          errors.push(t('import.errors.duplicateRegNumber').replace('{regNumber}', student.registrationNumber));
        }
        return { student, errors, row: index + 2 };
      });
      
      const results = await Promise.all(validationPromises);

      const validStudents = results.filter(r => r.errors.length === 0).map(r => r.student);
      const errors = results.filter(r => r.errors.length > 0).map(r => ({ row: r.row, messages: r.errors }));

      setValidationResult({ validStudents, errors });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('import.errors.fileReadError'),
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmImport = () => {
    if (!validationResult || validationResult.validStudents.length === 0) return;

    setIsLoading(true);
    const currentStudents: Student[] = JSON.parse(localStorage.getItem('students') || 'null') || mockStudents;
    const updatedStudents = [...validationResult.validStudents, ...currentStudents];
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    window.dispatchEvent(new Event('storage'));

    toast({
      title: t('import.successTitle'),
      description: t('import.successDescription').replace('{count}', String(validationResult.validStudents.length)),
    });

    setValidationResult(null);
    form.reset();
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('import.templateCard.title')}</CardTitle>
          <CardDescription>{t('import.templateCard.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => downloadTemplate(t)}>
            <Download className="mr-2 h-4 w-4" />
            {t('import.templateCard.button')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('import.uploadCard.title')}</CardTitle>
          <CardDescription>{t('import.uploadCard.description')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form>
            <CardContent>
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">{t('import.selectFile')}</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">{t('import.fileDrop.click')}</span> {t('import.fileDrop.drag')}
                                </p>
                                <p className="text-xs text-muted-foreground">{t('import.fileDrop.fileTypes')}</p>
                                {field.value && <p className="text-sm text-foreground mt-4">{field.value.name}</p>}
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </form>
        </Form>
      </Card>
      
      {isLoading && (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{t('import.loadingPreview')}</p>
        </div>
      )}

      {validationResult && (
        <div className="space-y-8">
          {validationResult.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('import.errors.title')}</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 max-h-60 overflow-y-auto">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>
                      <strong>Row {error.row}:</strong>
                      <ul className="list-disc pl-5">
                        {error.messages.map((msg, msgIndex) => <li key={msgIndex}>{msg}</li>)}
                      </ul>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validationResult.validStudents.length > 0 && (
            <Card>
              <CardHeader>
                 <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <CardTitle>{t('import.preview.title')}</CardTitle>
                 </div>
                <CardDescription>{t('import.preview.description').replace('{count}', String(validationResult.validStudents.length))}</CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('students.table.regNumber')}</TableHead>
                      <TableHead>{t('students.table.fullName')}</TableHead>
                      <TableHead>{t('students.table.department')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResult.validStudents.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>{student.registrationNumber}</TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>{student.serviceDepartment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                  <Button onClick={handleConfirmImport} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('import.confirmButton').replace('{count}', String(validationResult.validStudents.length))}
                  </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
