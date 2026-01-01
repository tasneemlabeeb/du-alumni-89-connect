import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });
const archivo = Archivo({ 
  subsets: ["latin"],
  variable: '--font-archivo',
});

export const metadata: Metadata = {
  title: "DUAAB89",
  description: "Alumni directory, news, events, and community for DU Alumni 89",
  icons: {
    icon: '/home_page/DUAAB logo Blue.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${archivo.variable}`}>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <Toaster />
              <Sonner />
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
