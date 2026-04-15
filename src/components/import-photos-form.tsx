
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/contexts/locale-provider';
import Image from 'next/image';
import { updateStudentPhotos } from '@/lib/data';

interface PreviewFile {
  file: File;
  name: string;
  previewUrl: string;
  registrationNumber: string;
  error?: string;
}

export function ImportPhotosForm() {
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocale();
  const { toast } = useToast();

  const formSchema = useMemo(() => z.object({
    files: z.array(z.instanceof(File)).min(1, t('importPhotos.errors.photoRequired')),
  }), [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    form.setValue('files', fileList);
    setIsLoading(true);
    setPreviewFiles([]);

    const previews = fileList.map(file => {
      const registrationNumber = file.name.split('.').slice(0, -1).join('.');
      return {
        file,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        registrationNumber,
        error: !registrationNumber ? t('importPhotos.errors.invalidFileName') : undefined,
      };
    });

    setPreviewFiles(previews);
    setIsLoading(false);
  };
  
  const handleConfirmImport = async () => {
    const validFiles = previewFiles.filter(f => !f.error);
    if (validFiles.length === 0) return;

    setIsLoading(true);
    try {
      const photoData = await Promise.all(
        validFiles.map(pf => 
          new Promise<{ registrationNumber: string; photo: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({
              registrationNumber: pf.registrationNumber,
              photo: reader.result as string,
            });
            reader.onerror = reject;
            reader.readAsDataURL(pf.file);
          })
        )
      );
      
      const result = await updateStudentPhotos(photoData);

      toast({
        title: t('importPhotos.successTitle'),
        description: t('importPhotos.successDescription', { count: result.count }),
      });
      
      if (result.notFound.length > 0) {
        toast({
            variant: 'destructive',
            title: t('importPhotos.errors.notFoundTitle'),
            description: t('importPhotos.errors.notFoundDescription', { numbers: result.notFound.join(', ') }),
        });
      }

      setPreviewFiles([]);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.errorDescription'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validFilesCount = useMemo(() => previewFiles.filter(f => !f.error).length, [previewFiles]);
  const errorFilesCount = useMemo(() => previewFiles.filter(f => f.error).length, [previewFiles]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('importPhotos.uploadCard.title')}</CardTitle>
          <CardDescription>{t('importPhotos.uploadCard.description')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form>
            <CardContent>
              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">{t('importPhotos.selectFiles')}</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">{t('import.fileDrop.click')}</span> {t('import.fileDrop.drag')}
                                </p>
                                <p className="text-xs text-muted-foreground">{t('importPhotos.fileDrop.fileTypes')}</p>
                                {form.getValues('files').length > 0 && 
                                    <p className="text-sm text-foreground mt-4">
                                        {t('importPhotos.filesSelected', { count: form.getValues('files').length })}
                                    </p>
                                }
                            </div>
                            <Input 
                                id="dropzone-file" 
                                type="file" 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/jpg" 
                                multiple
                                onChange={handleFileChange} 
                            />
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
      
      {isLoading && previewFiles.length === 0 && (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{t('import.loadingPreview')}</p>
        </div>
      )}

      {previewFiles.length > 0 && (
        <div className="space-y-8">
          {errorFilesCount > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('import.errors.title')}</AlertTitle>
              <AlertDescription>
                 <ul className="list-disc pl-5">
                    {previewFiles.filter(f => f.error).map((file, index) => (
                        <li key={index}>
                          <strong>{file.name}:</strong> {file.error}
                        </li>
                    ))}
                 </ul>
              </AlertDescription>
            </Alert>
          )}

          {validFilesCount > 0 && (
            <Card>
              <CardHeader>
                 <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <CardTitle>{t('importPhotos.preview.title')}</CardTitle>
                 </div>
                <CardDescription>{t('importPhotos.preview.description', { count: validFilesCount })}</CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('importPhotos.table.photo')}</TableHead>
                      <TableHead>{t('students.table.regNumber')}</TableHead>
                      <TableHead>{t('importPhotos.table.fileName')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewFiles.filter(f => !f.error).map((file, index) => (
                      <TableRow key={index}>
                        <TableCell>
                            <Image src={file.previewUrl} alt={file.name} width={40} height={40} className="rounded-md object-cover" />
                        </TableCell>
                        <TableCell>{file.registrationNumber}</TableCell>
                        <TableCell>{file.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                  <Button onClick={handleConfirmImport} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('importPhotos.confirmButton', { count: validFilesCount })}
                  </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
