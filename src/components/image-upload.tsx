'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
        <div className="w-48 h-48 rounded-md border border-dashed flex items-center justify-center bg-muted/50 relative overflow-hidden">
            {value ? (
                <>
                    <Image src={value} alt="Student photo" layout="fill" objectFit="cover" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7 rounded-full"
                        onClick={() => onChange('')}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove image</span>
                    </Button>
                </>

            ) : (
                <div className="text-center text-muted-foreground">
                    <Upload className="mx-auto h-12 w-12" />
                    <p className="text-sm mt-2">Upload a photo</p>
                </div>
            )}
        </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
