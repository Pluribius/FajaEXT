import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/layout/ThemeProvider";
import { AppProvider } from "@/components/auth/AppContext";
import { IndustrialHeader } from "@/components/ui/layout/header/IndustrialHeader";
import { AuthModal } from "@/components/auth/AuthModal";
import { EmailConfirmationModal } from "@/components/modals/EmailConfirmationModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PetroLink | FAJAEXT",
  description: "Plataforma de gestión Unificada ACTA CONVENIO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased transition-colors duration-250 bg-white text-slate-900`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppProvider>
            <div className="w-full min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#d9251d] selection:text-white">
              <IndustrialHeader />
              <main className="flex-1 flex flex-col">
                {children}
              </main>
              <AuthModal />
              <EmailConfirmationModal />
            </div>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
