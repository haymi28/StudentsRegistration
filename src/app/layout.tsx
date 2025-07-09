import type { Metadata } from "next";
import { PT_Sans, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { LocaleProvider } from "@/contexts/locale-provider";
import { MainLayout } from "@/components/common/main-layout";

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

export const metadata: Metadata = {
  title: "የደብረ ገሊላ ቅዱስ ዐማኑኤል ካቴድራል እግዚአብሔር ምስሌነ ሰ/ት/ቤት የተማሪዎች መመዝገቢያ ቅጽ",
  description: "A student registration and attendance management system.",
  icons: {
    icon: "https://debregelila.org/wp-content/uploads/2024/10/cropped-IMG_20240909_155141_966-scaled-1.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased", ptSans.variable, notoSansEthiopic.variable)}>
        <LocaleProvider>
            <MainLayout>
              {children}
            </MainLayout>
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  );
}
