import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";

import { ComplianceBanner } from "@/components/ui/ComplianceBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Souvera Intelligence Terminal | Afronovation",
  description: "Sovereign-grade macroeconomic intelligence for African and Caribbean markets.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen antialiased bg-zinc-925 text-white`}>
        <LanguageProvider>
          {children}
          <ComplianceBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
