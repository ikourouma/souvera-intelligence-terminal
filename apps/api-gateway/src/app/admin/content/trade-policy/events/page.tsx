import { Metadata } from 'next';
import Link from 'next/link';
import { Gavel, ArrowLeft, ExternalLink } from 'lucide-react';
import { AGOA_LEGISLATIVE_EVENTS } from '@/data/agoa-legislative-tracker';
import { formatDisplayDate } from '@/lib/data/utils';

export const metadata: Metadata = {
  title: 'Legislative Events | Trade Policy Admin',
  description: 'AGOA and trade policy legislative timeline (admin)',
};

export default function TradePolicyEventsAdminPage() {
  const events = [...AGOA_LEGISLATIVE_EVENTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/content/trade-policy"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Trade Policy
        </Link>
        <h1 className="text-2xl font-bold text-white">Legislative Events</h1>
        <p className="text-zinc-400 mt-1">
          {events.length} curated AGOA events — sourced from{' '}
          <code className="text-zinc-300">data/agoa-legislative-tracker.ts</code>
        </p>
      </div>

      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-400">
        <strong className="text-zinc-300">Data model:</strong> read-only curated file today. Phase 2 adds{' '}
        <code className="text-zinc-300">/api/v1/admin/trade-policy/events</code> CRUD with publish workflow
        and audit log (ADMIN-TPI-01).
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Gavel className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Timeline</h2>
        </div>
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-white font-medium text-sm">{event.title}</h3>
                <span className="text-xs text-zinc-500 shrink-0">{formatDisplayDate(event.date)}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{event.summary}</p>
              {event.status && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                  {event.status}
                </span>
              )}
              {event.source_url && (
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 text-xs mt-2 ml-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  Source
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
