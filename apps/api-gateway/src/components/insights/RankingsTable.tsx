import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Sparkles } from 'lucide-react';
import type { MarketRankingRow } from '@/lib/insights/market-rankings';
import { signalLevelClass } from '@/lib/insights/signal-display';

function formatGdp(value: number | null): string {
  if (value == null) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toFixed(0)}`;
}

function formatPopulation(value: number | null): string {
  if (value == null) return '—';
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return String(value);
}

function formatGdpPerCapita(value: number | null): string {
  if (value == null) return '—';
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export interface RankingsTableProps {
  title: string;
  subtitle?: string;
  rows: MarketRankingRow[];
  /** compact = regional table (fewer columns) */
  compact?: boolean;
  /** Pre-resolved hrefs keyed by ISO3 (auth-aware) */
  countryHrefs: Record<string, string>;
}

export function RankingsTable({
  title,
  subtitle,
  rows,
  compact = false,
  countryHrefs,
}: RankingsTableProps) {
  if (!rows.length) return null;

  return (
    <section className="border border-zinc-800 rounded-sm overflow-hidden bg-zinc-925">
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {title}
          </h2>
        </div>
        {subtitle && <p className="text-[10px] text-zinc-600 mt-1">{subtitle}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-600">
              <th className="text-left px-4 py-2 font-medium w-12">#</th>
              <th className="text-left px-4 py-2 font-medium">Market</th>
              {!compact && <th className="text-left px-4 py-2 font-medium">Region</th>}
              {!compact && <th className="text-left px-4 py-2 font-medium">Subregion</th>}
              <th className="text-right px-4 py-2 font-medium">GDP</th>
              {!compact && <th className="text-right px-4 py-2 font-medium">GDP / cap</th>}
              <th className="text-right px-4 py-2 font-medium">Growth</th>
              {!compact && <th className="text-right px-4 py-2 font-medium">Population</th>}
              <th className="text-left px-4 py-2 font-medium">Signal</th>
              <th className="px-4 py-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.iso3}
                className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-zinc-500 text-xs">{row.rank}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {row.flagUrl && (
                      <Image
                        src={row.flagUrl}
                        alt=""
                        width={20}
                        height={14}
                        className="w-5 h-3.5 object-cover rounded-sm border border-zinc-700"
                        unoptimized
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-white">{row.name}</span>
                        {row.isPilot && (
                          <Sparkles className="w-3 h-3 text-teal-400 shrink-0" aria-label="Full terminal pilot" />
                        )}
                      </div>
                      <span className="block text-[10px] font-mono text-zinc-600">{row.iso3}</span>
                    </div>
                  </div>
                </td>
                {!compact && (
                  <td className="px-4 py-3 text-xs text-zinc-500 capitalize">{row.region}</td>
                )}
                {!compact && (
                  <td className="px-4 py-3 text-xs text-zinc-500 max-w-[120px] truncate">
                    {row.subregion ?? '—'}
                  </td>
                )}
                <td className="px-4 py-3 text-right font-mono text-emerald-400">
                  {formatGdp(row.gdpCurrentUsd)}
                </td>
                {!compact && (
                  <td className="px-4 py-3 text-right font-mono text-zinc-400">
                    {formatGdpPerCapita(row.gdpPerCapitaUsd)}
                  </td>
                )}
                <td
                  className={`px-4 py-3 text-right font-mono ${
                    row.gdpGrowthPct != null && row.gdpGrowthPct >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {row.gdpGrowthPct != null
                    ? `${row.gdpGrowthPct > 0 ? '+' : ''}${row.gdpGrowthPct.toFixed(1)}%`
                    : '—'}
                </td>
                {!compact && (
                  <td className="px-4 py-3 text-right font-mono text-zinc-400">
                    {formatPopulation(row.populationTotal)}
                  </td>
                )}
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] uppercase tracking-wider ${signalLevelClass(row.signal.level)}`}
                    title={
                      row.signal.source === 'derived'
                        ? 'Signal derived from GDP growth (lite tier)'
                        : row.signal.source === 'score'
                          ? 'Signal from Souvera score model'
                          : 'Signal from country profile'
                    }
                  >
                    {row.signal.label}
                    {row.signal.source === 'derived' && (
                      <span className="text-zinc-600 normal-case ml-0.5">~</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={countryHrefs[row.iso3] ?? '#'}
                    className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
