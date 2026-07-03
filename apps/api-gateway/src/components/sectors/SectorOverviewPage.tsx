import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { SectorKeyMarkets } from '@/components/sectors/SectorKeyMarkets';
import { SectorProfessionalServicesCta } from '@/components/sectors/SectorProfessionalServicesCta';
import type { SectorOverviewTemplateProps } from './SectorOverviewTemplate';

const ACCENT_STYLES: Record<
  NonNullable<SectorOverviewTemplateProps['accentColor']>,
  { text: string; bg: string; border: string }
> = {
  blue: { text: 'text-blue-400', bg: 'bg-blue-600', border: 'border-blue-500/30' },
  green: { text: 'text-emerald-400', bg: 'bg-emerald-600', border: 'border-emerald-500/30' },
  teal: { text: 'text-teal-400', bg: 'bg-teal-600', border: 'border-teal-500/30' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-600', border: 'border-amber-500/30' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-600', border: 'border-purple-500/30' },
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-600', border: 'border-indigo-500/30' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-600', border: 'border-cyan-500/30' },
};

export function SectorOverviewPage({
  content,
  icon: Icon,
  accentColor = 'blue',
}: SectorOverviewTemplateProps) {
  const accent = ACCENT_STYLES[accentColor];

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <section className="pt-28 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <div className={`text-[10px] font-bold tracking-[0.2em] uppercase ${accent.text} mb-4`}>
              {content.tagline}
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {content.title}
            </h1>
            <p className="text-xl text-zinc-400 mb-4">{content.subtitle}</p>
            <p className="text-base text-zinc-500 leading-relaxed mb-8">{content.description}</p>
            <div className="flex flex-wrap gap-4 mb-8">
              <span className={`px-3 py-1 text-xs border rounded-sm ${accent.border} ${accent.text}`}>
                {content.marketSize}
              </span>
              <span className="px-3 py-1 text-xs border border-zinc-700 text-zinc-400 rounded-sm">
                {content.growthSignal}
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href={content.primaryCta.href}
                className={`inline-flex items-center gap-2 px-8 py-4 ${accent.bg} hover:opacity-90 text-white rounded-sm font-semibold`}
              >
                {content.primaryCta.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
              {content.secondaryCta && (
                <Link
                  href={content.secondaryCta.href}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-sm font-semibold"
                >
                  {content.secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Strategic Themes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.themes.map((theme) => (
              <div
                key={theme.id}
                id={theme.id}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm scroll-mt-24"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Icon className={`w-6 h-6 ${accent.text} shrink-0`} />
                  <h3 className="text-lg font-bold text-white">{theme.title}</h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{theme.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectorKeyMarkets
        iso3List={content.keyMarketIso3}
        accentText={accent.text}
        accentBorder={accent.border}
        sectorSlug={content.slug}
      />

      <SectorProfessionalServicesCta
        sectorSlug={content.slug}
        icon={Icon}
        accentText={accent.text}
        accentBg={accent.bg}
        accentBorder={accent.border}
      />

      <SouveraFooter />
    </main>
  );
}
