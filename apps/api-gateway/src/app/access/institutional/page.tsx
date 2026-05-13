import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Building2, Database, FileText, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Institutional Solutions | Souvera',
  description: 'Enterprise and institutional solutions for development finance institutions, governments, and global enterprises requiring custom Souvera intelligence.',
  openGraph: {
    title: 'Institutional Solutions | Souvera',
    description: 'Enterprise and institutional solutions for development finance institutions and global enterprises.',
    url: 'https://souvera.vercel.app/access/institutional',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/access/institutional',
  },
};

const SOLUTIONS = [
  {
    icon: Database,
    title: 'API Integration',
    description: 'RESTful API access with bulk data capabilities. Integrate Souvera intelligence directly into your proprietary systems.',
    features: ['JSON & CSV formats', 'Bulk data endpoints', 'Documentation & support'],
  },
  {
    icon: FileText,
    title: 'Custom Briefings',
    description: 'Tailored intelligence briefings and research reports aligned with your specific investment thesis or mandate.',
    features: ['Sector deep-dives', 'Country assessments', 'Custom metrics'],
  },
  {
    icon: Users,
    title: 'Dedicated Support',
    description: 'Account management and direct access to our research team for ongoing support and custom requests.',
    features: ['Named account manager', 'Priority support', 'Quarterly reviews'],
  },
];

export default function InstitutionalPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <section className="pt-24 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-sm mb-6">
              <Building2 className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-purple-400">
                Enterprise Solutions
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Institutional Intelligence.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed mb-8">
              Custom intelligence solutions for development finance institutions, governments, and global enterprises. Tailored to your specific requirements and mandates.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm flex items-center gap-2"
              >
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/access/request-access"
                className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SOLUTIONS.map((solution) => {
              const Icon = solution.icon;
              return (
                <div
                  key={solution.title}
                  className="p-8 bg-[#121821] border border-zinc-800 rounded-sm"
                >
                  <div className="w-12 h-12 rounded-sm bg-purple-600/10 border border-purple-600/20 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {solution.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                    {solution.description}
                  </p>
                  <div className="space-y-2">
                    {solution.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-zinc-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Who We Serve
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Development Finance Institutions', description: 'Track development indicators and investment impact.' },
              { name: 'Government & Public Sector', description: 'Benchmark economic performance and policy outcomes.' },
              { name: 'Investment Funds', description: 'FDI tracking and portfolio-relevant market intelligence.' },
              { name: 'Corporate Strategy', description: 'Market entry analysis and regional expansion planning.' },
            ].map((segment) => (
              <div
                key={segment.name}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm"
              >
                <h4 className="font-bold text-white mb-2">{segment.name}</h4>
                <p className="text-sm text-zinc-500">{segment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="bg-purple-600/10 border border-purple-600/30 rounded-sm p-12 text-center">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Ready to discuss your requirements?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
              Our team is available to discuss your specific intelligence needs and design a solution that fits your mandate.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
            >
              Contact Our Team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
