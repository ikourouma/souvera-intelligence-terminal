import Link from 'next/link';
import { ArrowRight, Briefcase } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getSectorProfessionalServicesCta } from '@/data/sectors/sector-professional-services-cta';

interface SectorProfessionalServicesCtaProps {
  sectorSlug: string;
  icon: LucideIcon;
  accentText: string;
  accentBg: string;
  accentBorder: string;
}

export function SectorProfessionalServicesCta({
  sectorSlug,
  icon: Icon,
  accentText,
  accentBg,
  accentBorder,
}: SectorProfessionalServicesCtaProps) {
  const content = getSectorProfessionalServicesCta(sectorSlug);
  const learnMoreHref = `/professional-services#${content.slug}`;
  const contactHref = `/contact?intent=professional-services&sector=${encodeURIComponent(content.slug)}`;

  return (
    <section className="py-16 border-t border-zinc-800/50">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div
          className={`relative overflow-hidden rounded-sm border ${accentBorder} bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-[#0B0F14] p-8 md:p-12`}
        >
          <div
            className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full pointer-events-none opacity-40"
            style={{
              background: `radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)`,
              transform: 'translate(25%, -25%)',
            }}
          />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-sm border ${accentBorder} bg-zinc-950/80`}>
                  <Icon className={`w-5 h-5 ${accentText}`} />
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-zinc-500" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">
                    Souvera Professional Services
                  </span>
                </div>
              </div>
              <h2
                className="text-2xl md:text-3xl font-bold text-white"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {content.headline}
              </h2>
              <p className="text-zinc-400 leading-relaxed max-w-2xl">{content.description}</p>
              <p className={`text-xs font-mono uppercase tracking-wider ${accentText}`}>
                {content.highlight}
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-stretch">
              <Link
                href={learnMoreHref}
                className={`inline-flex items-center justify-center gap-2 px-6 py-4 ${accentBg} hover:opacity-90 text-white rounded-sm font-semibold text-sm`}
              >
                Learn more
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={contactHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-white rounded-sm font-semibold text-sm"
              >
                Contact our team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
