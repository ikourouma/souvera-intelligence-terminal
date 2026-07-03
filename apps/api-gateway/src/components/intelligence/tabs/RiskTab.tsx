'use client';

import Link from 'next/link';
import {
  AlertTriangle, TrendingDown, Shield, Users, DollarSign, Zap,
  CheckCircle2, AlertCircle, Download,
} from 'lucide-react';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { exportCardToPNG } from '@/lib/intelligence/export-png';
import { countryExportContext } from '@/lib/intelligence/export-branding';
import { markdownToHtml, parseMarkdownSections } from '@/lib/intelligence/markdown';
import {
  getRiskContent,
  riskSeverityClass,
  type RiskCategoryContent,
  type MitigationStrategy,
} from '@/lib/intelligence/country-risk-content';
import { hydrateRiskContent } from '@/lib/intelligence/hydrate-intelligence-content';
import { DataPendingState } from '@/components/intelligence/DataPendingState';
import type { IntelligenceTabProps } from '@/types/country-intelligence';

const MITIGATION_ICONS = {
  users: Users,
  shield: Shield,
  dollar: DollarSign,
  check: CheckCircle2,
} as const;

const CATEGORY_ICONS = {
  macro: TrendingDown,
  political: Shield,
  operational: Zap,
} as const;

function AnalysisBullets({ bullets }: { bullets: string[] }) {
  if (!bullets.length) return null;
  return (
    <div className="mt-4 pt-3 border-t border-zinc-800">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Souvera Analysis</p>
      <ul className="space-y-1 text-xs text-zinc-400">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RiskScorecard({ 
  signal, 
  onExport 
}: { 
  signal: IntelligenceTabProps['data']['signal'];
  onExport: () => void;
}) {
  const score = signal?.investmentScore;
  const level = signal?.level ?? 'stable';
  const rows = [
    { category: 'Macro', level: score != null && score >= 60 ? 'Low' : score != null && score >= 40 ? 'Moderate' : 'Elevated' },
    { category: 'Political', level: level === 'risk_elevated' ? 'High' : 'Moderate' },
    { category: 'Operational', level: 'Moderate' },
    { category: 'Sector', level: score != null && score >= 55 ? 'Moderate' : 'Elevated' },
  ];
  const color = (l: string) =>
    l === 'Low' ? 'text-emerald-400' : l === 'Moderate' ? 'text-amber-400' : 'text-red-400';

  return (
    <div id="risk-scorecard" className="exportable-card group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      {/* Hover-activated PNG download button */}
      <button
        type="button"
        onClick={onExport}
        data-export-exclude
        className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        title="Download Risk Scorecard as PNG"
        aria-label="Download Risk Scorecard as PNG"
      >
        <Download className="w-4 h-4 text-zinc-300" />
      </button>
      
      <h3 className="text-lg font-bold text-white mb-4">Risk Scorecard</h3>
      {score == null ? (
        <DataPendingState
          variant="pending"
          message="Risk scores are awaiting verified signal model inputs from macro, governance, and news sources."
          className="border-0 bg-transparent p-0"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {rows.map((r) => (
            <div key={r.category} className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <div className="text-xs text-zinc-500 uppercase mb-1">{r.category}</div>
              <div className={`text-lg font-bold ${color(r.level)}`}>{r.level}</div>
            </div>
          ))}
        </div>
      )}
      {score != null && (
        <p className="text-xs text-zinc-500 mt-3">Investment signal score: {score}/100 · Source: Souvera signal model</p>
      )}
    </div>
  );
}

function RiskCategoryCard({
  category,
  onExport,
}: {
  category: RiskCategoryContent;
  onExport: () => void;
}) {
  const Icon = CATEGORY_ICONS[category.icon];
  const hoverBorder = category.icon === 'macro' ? 'hover:border-amber-500/30' :
    category.icon === 'political' ? 'hover:border-red-500/30' : 'hover:border-blue-500/30';
  const accentClass = category.icon === 'macro' ? 'text-amber-400' :
    category.icon === 'political' ? 'text-red-400' : 'text-blue-400';
  const iconBg = category.icon === 'macro' ? 'from-red-500/20 to-amber-500/20' :
    category.icon === 'political' ? 'from-amber-500/20 to-red-500/20' : 'from-blue-500/20 to-cyan-500/20';

  return (
    <div
      id={category.exportId}
      className={`exportable-card group relative bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 transition-all duration-300 ${hoverBorder}`}
    >
      {/* Hover-activated PNG download button */}
      <button
        type="button"
        onClick={onExport}
        data-export-exclude
        className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        title={`Download ${category.title} as PNG`}
        aria-label={`Download ${category.title} as PNG`}
      >
        <Download className="w-4 h-4 text-zinc-300" />
      </button>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-12 h-12 bg-gradient-to-br ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${accentClass}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-lg font-bold text-white">{category.title}</h4>
              <HelpTooltip term={category.icon === 'macro' ? 'macro_risks' : category.icon === 'political' ? 'political_risks' : 'operational_risks'} />
            </div>
            <p className={`text-sm font-semibold mb-3 ${accentClass}`}>{category.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {category.items.map((item) => (
          <div key={item.title} className="bg-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold text-white">{item.title}</h5>
              <span className={`text-xs px-2 py-1 rounded ${riskSeverityClass(item.severityTone)}`}>{item.severity}</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-3">{item.body}</p>
            {item.mitigants && item.mitigants.length > 0 && (
              <div className="text-xs text-zinc-400">
                {item.mitigants.map((m, i) => (
                  <span key={m}>
                    {i > 0 ? ' • ' : ''}
                    <span className="text-emerald-400">✓</span> {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {category.securityItems && category.securityItems.length > 0 && (
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-white mb-2">Regional Security Concerns</h5>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {category.securityItems.map((s) => (
                    <li key={s.region} className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span><span className="text-white font-medium">{s.region}:</span> {s.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {category.mitigatingFactor && (
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-400 mb-1">{category.mitigatingFactor.title}</p>
                <p className="text-xs text-zinc-300">{category.mitigatingFactor.body}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MitigationCard({ strategy }: { strategy: MitigationStrategy }) {
  const Icon = MITIGATION_ICONS[strategy.icon];
  const iconBg = strategy.icon === 'users' ? 'bg-emerald-500/20 text-emerald-400' :
    strategy.icon === 'shield' ? 'bg-blue-500/20 text-blue-400' :
    strategy.icon === 'dollar' ? 'bg-amber-500/20 text-amber-400' :
    'bg-cyan-500/20 text-cyan-400';

  return (
    <div className={`bg-zinc-800/50 rounded-lg p-5 hover:bg-zinc-800/70 transition-colors border ${strategy.borderClass}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-white mb-2">{strategy.title}</h4>
          <p className="text-sm text-zinc-300">{strategy.body}</p>
        </div>
      </div>
    </div>
  );
}

export default function RiskTab({ data, userEntitlements }: IntelligenceTabProps) {
  const hasBusinessAccess = userEntitlements.includes('risk_analysis') || userEntitlements.includes('admin_access');
  const countryName = data.country.name;
  const iso3 = data.country.iso3.toUpperCase();
  const iso3Lower = iso3.toLowerCase();
  const content = hydrateRiskContent(getRiskContent(iso3, countryName), data);
  const exportCtx = countryExportContext(data.country);

  const narrativeIntro = data.narrative?.riskNarrative
    ? parseMarkdownSections(data.narrative.riskNarrative).find((s) => !s.title)?.body?.slice(0, 400)
    : null;

  const handleExport = (cardId: string, fileName: string, cardTitle: string) =>
    exportCardToPNG({ elementId: cardId, fileName, cardTitle, ...exportCtx });

  if (!hasBusinessAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border border-zinc-700/50 rounded-lg p-8 text-center">
          <Shield className="w-16 h-16 text-amber-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-3">Business+ Feature</h3>
          <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
            Unlock comprehensive risk analysis, mitigation strategies, and risk-adjusted return frameworks for informed decision-making.
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
      <div className="bg-gradient-to-br from-amber-900/20 to-red-900/20 border border-amber-500/20 rounded-xl p-6 lg:p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Risk Landscape</h2>
              <p className="text-sm text-zinc-400">{content.heroSubtitle}</p>
            </div>
          </div>
          <HelpTooltip term="risk_overview" />
        </div>

        <div className="prose prose-invert max-w-none">
          {data.narrative?.riskNarrative ? (
            <div
              className="text-base text-zinc-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(narrativeIntro || `${data.narrative.riskNarrative.slice(0, 500)}...`) }}
            />
          ) : (
            <p className="text-base text-zinc-300 leading-relaxed">{content.heroFallback}</p>
          )}
        </div>
      </div>

      <RiskScorecard 
        signal={data.signal} 
        onExport={() => handleExport('risk-scorecard', `${iso3Lower}-risk-scorecard`, 'Risk Scorecard')} 
      />

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          Risk Categories
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RiskCategoryCard
            category={content.macro}
            onExport={() => handleExport(content.macro.exportId, `${iso3Lower}-${content.macro.exportFileSlug}`, content.macro.exportTitle)}
          />
          <RiskCategoryCard
            category={content.political}
            onExport={() => handleExport(content.political.exportId, `${iso3Lower}-${content.political.exportFileSlug}`, content.political.exportTitle)}
          />
          <RiskCategoryCard
            category={content.operational}
            onExport={() => handleExport(content.operational.exportId, `${iso3Lower}-${content.operational.exportFileSlug}`, content.operational.exportTitle)}
          />
        </div>
      </div>

      <div id="risk-mitigation-card" className="exportable-card group relative bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 lg:p-8">
        {/* Hover-activated PNG download button */}
        <button
          type="button"
          onClick={() => handleExport('risk-mitigation-card', `${iso3Lower}-risk-mitigation`, 'Risk Mitigation Strategies')}
          data-export-exclude
          className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          title="Download Risk Mitigation Strategies as PNG"
          aria-label="Download Risk Mitigation Strategies as PNG"
        >
          <Download className="w-4 h-4 text-zinc-300" />
        </button>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Risk Mitigation Strategies</h3>
          </div>
          <HelpTooltip term="risk_mitigation" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.mitigationStrategies.map((s) => (
            <MitigationCard key={s.title} strategy={s} />
          ))}
        </div>
        <AnalysisBullets bullets={content.mitigationBullets} />
      </div>

      <div id="risk-adjusted-returns-card" className="exportable-card group relative bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border border-emerald-500/20 rounded-xl p-6 lg:p-8">
        {/* Hover-activated PNG download button */}
        <button
          type="button"
          onClick={() => handleExport('risk-adjusted-returns-card', `${iso3Lower}-risk-adjusted-returns`, 'Risk-Adjusted Returns')}
          data-export-exclude
          className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          title="Download Risk-Adjusted Returns as PNG"
          aria-label="Download Risk-Adjusted Returns as PNG"
        >
          <Download className="w-4 h-4 text-zinc-300" />
        </button>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Risk-Adjusted Returns</h3>
          </div>
        </div>

        <p className="text-base text-zinc-300 leading-relaxed mb-4">{content.riskAdjustedNarrative}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {content.riskAdjustedStats.map((stat) => (
            <div key={stat.label} className="bg-zinc-800/30 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold mb-1 ${stat.accentClass}`}>{stat.value}</div>
              <div className="text-sm text-zinc-400">{stat.label}</div>
              <p className="text-xs text-zinc-500 mt-2">{stat.sublabel}</p>
            </div>
          ))}
        </div>
        <AnalysisBullets bullets={content.returnsBullets} />
      </div>

      <div className="bg-gradient-to-br from-amber-900/30 to-red-900/30 border border-amber-500/30 rounded-xl p-6 text-center">
        <h4 className="text-lg font-bold text-white mb-2">Need a Comprehensive Risk Assessment?</h4>
        <p className="text-sm text-zinc-300 mb-4">
          Our risk advisory team can provide detailed country risk analysis, sector-specific risk profiles, and customized mitigation frameworks.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors">
            Request Risk Assessment
          </Link>
          <Link href={`/country/${iso3}?tab=reports`} className="px-6 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-semibold transition-colors">
            Download Risk Report
          </Link>
        </div>
      </div>
    </div>
  );
}
