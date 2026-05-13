import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";

import { ComplianceBanner } from "@/components/ui/ComplianceBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://souvera.vercel.app'),
  title: {
    default: 'Souvera Intelligence Terminal',
    template: '%s | Souvera',
  },
  description: 'Institutional-grade macroeconomic intelligence for African and Caribbean markets. Data-driven insights for governments, investors, and enterprises.',
  keywords: [
    'Africa investment',
    'Caribbean economic data',
    'macroeconomic intelligence',
    'emerging markets',
    'FDI intelligence',
    'Africa GDP',
    'Caribbean markets',
  ],
  authors: [{ name: 'Afronovation, Inc.' }],
  creator: 'Afronovation, Inc.',
  publisher: 'Afronovation, Inc.',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Souvera Intelligence Terminal',
    title: 'Souvera Intelligence Terminal',
    description: 'Institutional-grade macroeconomic intelligence for African and Caribbean markets.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Souvera Intelligence Terminal',
    description: 'Institutional-grade macroeconomic intelligence for African and Caribbean markets.',
  },
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
