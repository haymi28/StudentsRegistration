
import { LoginForm } from "@/components/login-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/common/main-layout";
import Image from "next/image";
import { getTranslator } from "@/lib/i18n";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const t = await getTranslator();
  const session = await getServerSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <MainLayout isAuthenticated={false}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 pt-20 sm:pt-4">
            <div className="text-center mb-8">
                <Image 
                    src="https://debregelila.org/wp-content/uploads/2024/09/Sunday-School-Final-Logo-2.png" 
                    alt="Debre Gelila St. Amanuel Cathedral Logo" 
                    width={120} 
                    height={120}
                    className="rounded-full shadow-lg mx-auto"
                    priority
                />
                <h1 className="text-xl sm:text-2xl font-bold text-primary font-headline mt-4 px-4">
                    የደብረ ገሊላ ዐማኑኤል ካቴድራል እግዚአብሔር ምስሌነ ሰ/ት/ቤት
                </h1>
                <p className="text-lg sm:text-xl font-semibold text-muted-foreground mt-2">የተማሪዎች መመዝገቢያና መቆጣጠሪያ ዘዴ</p>
            </div>
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl sm:text-3xl font-bold font-headline">{t('login.title')}</CardTitle>
                    <CardDescription>{t('login.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    </MainLayout>
  );
}
