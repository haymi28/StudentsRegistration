'use client';

import { LoginForm } from "@/components/login-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useLocale } from "@/contexts/locale-provider";
import Image from "next/image";

export default function HomePage() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
        <Image 
            src="https://debregelila.org/wp-content/uploads/2024/10/cropped-IMG_20240909_155141_966-scaled-1.jpg" 
            alt="Debre Gelila St. Amanuel Cathedral Logo" 
            width={120} 
            height={120}
            className="rounded-md shadow-md"
        />
        <h1 className="text-xl font-bold text-primary font-headline sm:text-2xl px-4">
            የደብረ ገሊላ ቅዱስ ዐማኑኤል ካቴድራል እግዚአብሔር ምስሌነ ሰ/ት/ቤት የተማሪዎች መመዝገቢያ ቅጽ
        </h1>
        <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-headline sm:text-3xl">{t('login.title')}</CardTitle>
            <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <LoginForm />
        </CardContent>
        </Card>
    </div>
  );
}
