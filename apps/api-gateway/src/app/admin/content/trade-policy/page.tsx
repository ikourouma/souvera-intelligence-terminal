import { Metadata } from 'next';
import Link from 'next/link';
import { Scale, Gavel, ArrowLeft, ExternalLink } from 'lucide-react';
import { AGOA_LEGISLATIVE_EVENTS } from '@/data/agoa-legislative-tracker';
import { buildCuratedAgoaStatuses } from '@/data/agoa-full-coverage';
import { getAGOAStatusLabel, getAGOAStatusColor } from '@/lib/data/utils';
import { formatDisplayDate } from '@/lib/data/utils';

export const metadata: Metadata = {
  title: 'Trade Policy | Admin',
  description: 'Review AGOA and trade policy curated intelligence',
};

export default function TradePolicyAdminPage() {
  const pilotIso3 = ['NGA', 'KEN', 'GHA', 'JAM'] as const;
  const pilotStatuses = buildCuratedAgoaStatuses().filter((row) =>
    pilotIso3.includes(row.country_iso3 as (typeof pilotIso3)[number])
  );

  const events = [...AGOA_LEGISLATIVE_EVENTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/content/news" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" />
          Content Admin
        </Link>
        <h1 className="text-2xl font-bold text-white">Trade Policy Intelligence</h1>
        <p className="text-zinc-400 mt-1">
          Curated AGOA status and legislative events. DB-backed editor ships in Phase 2.
        </p>
      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-200/90">
        Updates currently require editing{' '}
        <code className="text-amber-300">data/agoa-legislative-tracker.ts</code> and redeploy.
        Full admin CRUD with publish workflow is planned (ADMIN-TPI-01).
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Legislative Timeline ({events.length} events)</h2>
          </div>
          <Link
            href="/admin/content/trade-policy/events"
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            View all events →
          </Link>
        </div>
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-white font-medium text-sm">{event.title}</h3>
                <span className="text-xs text-zinc-500 shrink-0">{formatDisplayDate(event.date)}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{event.summary}</p>
              {event.source_url && (
                <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 text-xs mt-2">
                  <ExternalLink className="w-3 h-3" />
                  Source
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Pilot AGOA Status (sample)</h2>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          Full 54-country coverage on{' '}
          <Link href="/intelligence/trade/agoa" className="text-blue-400 hover:text-blue-300">
            public AGOA tracker
          </Link>
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {pilotStatuses.map((row) => (
            <div key={row.country_iso3} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{row.country_name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getAGOAStatusColor(row.agoa_status)}`}>
                  {getAGOAStatusLabel(row.agoa_status)}
                </span>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-3">{row.agoa_notes}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
