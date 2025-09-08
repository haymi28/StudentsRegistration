
'use client';

import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-provider';
import { Student } from '@prisma/client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ExportPhotosClientProps {
  students: Student[];
}

export function ExportPhotosClient({ students }: ExportPhotosClientProps) {
  const { t } = useLocale();
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set(students.map(s => s.id)));
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(new Set(students.map(s => s.id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleRowSelect = (studentId: string, checked: boolean) => {
    const newSelection = new Set(selectedStudentIds);
    if (checked) {
      newSelection.add(studentId);
    } else {
      newSelection.delete(studentId);
    }
    setSelectedStudentIds(newSelection);
  };

  const handleExport = async () => {
    const studentsToExport = students.filter(s => selectedStudentIds.has(s.id));
    if (studentsToExport.length === 0) {
      toast({
        variant: 'destructive',
        title: t('export.noSelectionTitle'),
        description: t('exportPhotos.noSelectionDescription'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const zip = new JSZip();
      
      const imageFetchPromises = studentsToExport.map(async (student) => {
        if (student.photo) {
          const response = await fetch(student.photo);
          const blob = await response.blob();
          const fileExtension = student.photo.startsWith('data:image/jpeg') ? 'jpg' : 'png';
          zip.file(`${student.registrationNumber}.${fileExtension}`, blob);
        }
      });
      
      await Promise.all(imageFetchPromises);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `student_photos_${new Date().toISOString().split('T')[0]}.zip`);

      toast({
        title: t('exportPhotos.successTitle'),
        description: t('exportPhotos.successDescription', { count: studentsToExport.length }),
      });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('exportPhotos.pageTitle')}</CardTitle>
        <CardDescription>{t('exportPhotos.pageDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Checkbox
                    id="select-all"
                    checked={selectedStudentIds.size > 0 && selectedStudentIds.size === students.length}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    disabled={!students.length}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                    {t('exportPhotos.selectAll', { count: students.length })}
                </label>
            </div>
            <Button onClick={handleExport} disabled={isLoading || selectedStudentIds.size === 0}>
                {isLoading 
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Download className="mr-2 h-4 w-4" />
                }
                {t('exportPhotos.button', { count: selectedStudentIds.size })}
            </Button>
        </div>

        {students.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {students.map((student) => (
                <div key={student.id} className="relative group">
                    <label htmlFor={`student-${student.id}`} className="cursor-pointer">
                        <Avatar className="h-32 w-32 rounded-lg">
                            <AvatarImage src={student.photo!} alt={student.fullName} className="object-cover" />
                            <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <Checkbox
                                id={`student-${student.id}`}
                                className="h-6 w-6 border-white text-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                checked={selectedStudentIds.has(student.id)}
                                onCheckedChange={(checked) => handleRowSelect(student.id, !!checked)}
                            />
                        </div>
                    </label>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                        <p className="truncate font-semibold">{student.fullName}</p>
                        <p className="truncate">{student.registrationNumber}</p>
                    </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <ImageIcon className="h-12 w-12 mb-4" />
                <p className="font-semibold">{t('exportPhotos.noPhotosTitle')}</p>
                <p className="text-sm">{t('exportPhotos.noPhotosDescription')}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
