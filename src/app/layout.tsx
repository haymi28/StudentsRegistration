
import type { Metadata } from "next";
import { PT_Sans, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { LocaleProvider } from "@/contexts/locale-provider";
import { getTranslator } from "@/lib/i18n";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-sans",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-ethiopic",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    icons: {
      icon: "/image/logo.jpg",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-body antialiased", ptSans.variable, notoSansEthiopic.variable)}>
        <LocaleProvider>
            {children}
            <Toaster />
        </LocaleProvider>
      </body>
    </html>
  );
}
