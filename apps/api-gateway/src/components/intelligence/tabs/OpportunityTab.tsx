'use client';

import {
  TrendingUp, DollarSign, Building2, Users, Globe, Shield, Zap, Briefcase, Download,
} from 'lucide-react';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import Link from 'next/link';
import { markdownToHtml, parseMarkdownSections } from '@/lib/intelligence/markdown';
import { exportCardToPNG } from '@/lib/intelligence/export-png';
import { countryExportContext } from '@/lib/intelligence/export-branding';
import {
  getOpportunityContent,
  type OpportunityPillar,
  type OpportunityEntryPoint,
  type RegionalAdvantage,
} from '@/lib/intelligence/country-opportunity-content';
import { buildOpportunityComputedMetrics } from '@/lib/intelligence/opportunity-computed-metrics';
import type { IntelligenceTabProps } from '@/types/country-intelligence';

const PILLAR_ICONS = {
  zap: Zap,
  trending: TrendingUp,
  building: Building2,
} as const;

const ENTRY_ICONS = {
  building: Building2,
  trending: TrendingUp,
  zap: Zap,
  dollar: DollarSign,
} as const;

const REGIONAL_ICONS = {
  globe: Globe,
  shield: Shield,
  users: Users,
} as const;

export default function OpportunityTab({ data, userEntitlements }: IntelligenceTabProps) {
  const hasBusinessAccess = userEntitlements.includes('investment_thesis') || userEntitlements.includes('admin_access');
  const countryName = data.country.name;
  const iso3 = data.country.iso3.toUpperCase();
  const iso3Lower = iso3.toLowerCase();
  const content = getOpportunityContent(iso3, countryName);
  const computedMetrics = buildOpportunityComputedMetrics({
    iso3,
    countryName,
    metrics: data.metrics,
    trade: data.trade,
    sectors: data.sectors,
  });
  const exportCtx = countryExportContext(data.country);
  const thesisSections = data.narrative?.opportunityThesis
    ? parseMarkdownSections(data.narrative.opportunityThesis)
    : [];

  const handleExport = (cardId: string, fileName: string, cardTitle: string) =>
    exportCardToPNG({ elementId: cardId, fileName, cardTitle, ...exportCtx });

  if (!hasBusinessAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border border-zinc-700/50 rounded-lg p-8 text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-3">Business+ Feature</h3>
          <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
            Unlock in-depth investment opportunity analysis, entry point strategies, and regional market access intelligence.
          </p>
          <Link href="/pricing" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
            Upgrade to Business
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-blue-900/20 to-emerald-900/20 border border-blue-500/20 rounded-xl p-6 lg:p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Investment Opportunity</h2>
              <p className="text-sm text-zinc-400">{content.heroSubtitle}</p>
            </div>
          </div>
          <HelpTooltip term="opportunity_overview" />
        </div>

        <div className="prose prose-invert max-w-none">
          {thesisSections.length > 0 ? (
            <div
              className="text-base text-zinc-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(thesisSections[0].body.slice(0, 600)) }}
            />
          ) : (
            <p className="text-base text-zinc-300 leading-relaxed">{content.heroFallback}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          Core Investment Pillars
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {content.pillars.map((pillar) => (
            <PillarCard
              key={pillar.exportId}
              pillar={pillar}
              iso3Lower={iso3Lower}
              onExport={() => handleExport(pillar.exportId, `${iso3Lower}-${pillar.exportFileSlug}`, pillar.exportTitle)}
            />
          ))}
        </div>
      </div>

      <div id="investment-entry-points-card" className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Investment Entry Points</h3>
          </div>
          <div className="flex items-center gap-2">
            <HelpTooltip term="investment_entry_points" />
            <button
              type="button"
              onClick={() => handleExport('investment-entry-points-card', `${iso3Lower}-investment-entry-points`, 'Investment Entry Points')}
              data-export-exclude
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PNG</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.entryPoints.map((entry) => (
            <EntryPointCard key={entry.title} entry={entry} />
          ))}
        </div>
      </div>

      {computedMetrics.length > 0 && (
        <div id="live-market-signals-card" className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Live Market Signals</h3>
            <button
              type="button"
              onClick={() => handleExport('live-market-signals-card', `${iso3Lower}-live-market-signals`, 'Live Market Signals')}
              data-export-exclude
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PNG</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {computedMetrics.map((adv) => (
              <RegionalAdvantageCard key={adv.label} advantage={adv} />
            ))}
          </div>
        </div>
      )}

      <div id="regional-advantages-card" className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Regional Market Advantages</h3>
          </div>
          <div className="flex items-center gap-2">
            <HelpTooltip term="regional_advantages" />
            <button
              type="button"
              onClick={() => handleExport('regional-advantages-card', `${iso3Lower}-regional-advantages`, 'Regional Market Advantages')}
              data-export-exclude
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PNG</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.regionalAdvantages.map((adv) => (
            <RegionalAdvantageCard key={adv.label} advantage={adv} />
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/30 to-emerald-900/30 border border-blue-500/30 rounded-xl p-6 text-center">
        <h4 className="text-lg font-bold text-white mb-2">Ready to Explore Investment Opportunities?</h4>
        <p className="text-sm text-zinc-300 mb-4">
          Connect with our investment advisory team for detailed sector analysis, partner introductions, and deal structuring support.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
            Schedule Consultation
          </Link>
          <Link href={`/country/${iso3}?tab=reports`} className="px-6 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-semibold transition-colors">
            Download Investment Brief
          </Link>
        </div>
      </div>
    </div>
  );
}

function PillarCard({
  pillar,
  onExport,
}: {
  pillar: OpportunityPillar;
  iso3Lower: string;
  onExport: () => void;
}) {
  const Icon = PILLAR_ICONS[pillar.icon];
  const iconBg = pillar.icon === 'zap' ? 'from-blue-500/20 to-cyan-500/20' :
    pillar.icon === 'trending' ? 'from-emerald-500/20 to-green-500/20' :
    'from-amber-500/20 to-orange-500/20';

  return (
    <div
      id={pillar.exportId}
      className={`bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 transition-all duration-300 ${pillar.borderHover}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-12 h-12 bg-gradient-to-br ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${pillar.accentClass}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-lg font-bold text-white">{pillar.title}</h4>
              <HelpTooltip term={pillar.helpTerm} />
            </div>
            <p className={`text-sm font-semibold mb-3 ${pillar.accentClass}`}>{pillar.subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onExport}
          data-export-exclude
          className={`shrink-0 text-xs ${pillar.accentClass} hover:opacity-80 flex items-center gap-1 transition-colors`}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PNG</span>
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">{pillar.narrative}</p>
        <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Key Opportunities</p>
          <ul className="space-y-2 text-sm text-zinc-300">
            {pillar.bullets.map((b) => (
              <li key={b.label} className="flex items-start gap-2">
                <span className={`${pillar.accentClass} mt-0.5`}>•</span>
                <span><span className="text-white font-medium">{b.label}:</span> {b.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function EntryPointCard({ entry }: { entry: OpportunityEntryPoint }) {
  const Icon = ENTRY_ICONS[entry.icon];
  const iconBg = entry.icon === 'building' ? 'bg-blue-500/20 text-blue-400' :
    entry.icon === 'trending' ? 'bg-emerald-500/20 text-emerald-400' :
    entry.icon === 'zap' ? 'bg-amber-500/20 text-amber-400' :
    'bg-cyan-500/20 text-cyan-400';

  return (
    <div className="bg-zinc-800/50 rounded-lg p-5 hover:bg-zinc-800/70 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-white mb-2">{entry.title}</h4>
          <p className="text-sm text-zinc-300">{entry.body}</p>
        </div>
      </div>
    </div>
  );
}

function RegionalAdvantageCard({ advantage }: { advantage: RegionalAdvantage }) {
  const Icon = REGIONAL_ICONS[advantage.icon];
  const iconColor = advantage.icon === 'globe' ? 'text-blue-400' :
    advantage.icon === 'shield' ? 'text-blue-400' : 'text-emerald-400';

  return (
    <div className="bg-zinc-800/50 rounded-lg p-5 text-center hover:bg-zinc-800/70 transition-colors">
      <Icon className={`w-8 h-8 ${iconColor} mx-auto mb-3`} />
      <div className={`text-lg font-bold mb-1 leading-snug break-words ${advantage.accentClass}`}>{advantage.value}</div>
      <div className="text-sm text-zinc-400 mb-2">{advantage.label}</div>
      <p className="text-xs text-zinc-500">{advantage.sublabel}</p>
    </div>
  );
}
