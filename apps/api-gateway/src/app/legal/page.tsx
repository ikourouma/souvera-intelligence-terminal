import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { FileText, Lock, Eye, Accessibility } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Legal | Souvera',
  description: 'Legal documentation for Souvera Intelligence: privacy policy, terms of service, cookie policy, and accessibility statement.',
  openGraph: {
    title: 'Legal | Souvera',
    description: 'Legal documentation for Souvera Intelligence platform.',
    url: 'https://souvera.vercel.app/legal',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/legal',
  },
};

const LEGAL_NODES = [
  {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
    href: '/legal/privacy',
    icon: Lock,
  },
  {
    title: 'Terms of Service',
    description: 'Terms and conditions for using the Souvera platform.',
    href: '/legal/terms',
    icon: FileText,
  },
  {
    title: 'Cookie Policy',
    description: 'Information about cookies and tracking technologies we use.',
    href: '/legal/cookies',
    icon: Eye,
  },
  {
    title: 'Accessibility',
    description: 'Our commitment to making Souvera accessible to all users.',
    href: '/legal/accessibility',
    icon: Accessibility,
  },
];

export default function LegalHubPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      <section className="pt-24 pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Legal
            </div>
            <h1
              className="text-4xl font-bold mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Legal Documentation.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Legal policies and compliance documentation for the Souvera Intelligence platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LEGAL_NODES.map((node) => {
              const Icon = node.icon;
              return (
                <Link
                  key={node.href}
                  href={node.href}
                  className="group p-8 bg-[#121821] border border-zinc-800 rounded-sm hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-blue-500/10 rounded-sm">
                      <Icon className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <h2
                    className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {node.title}
                  </h2>
                  <p className="text-sm text-zinc-500 leading-relaxed">{node.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <SouveraFooter />
    </main>
  );
}
