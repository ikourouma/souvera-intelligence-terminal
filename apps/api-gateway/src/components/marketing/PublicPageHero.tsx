import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';

export type PublicPageHeroCta = {
  href: string;
  label: string;
  variant: 'primary' | 'secondary' | 'signup';
};

export type PublicPageHeroProps = {
  label: string;
  title: string;
  description: string;
  lastUpdated?: string;
  ctas?: PublicPageHeroCta[];
  stats?: { value: string; label: string }[];
  backLink?: { href: string; label: string };
  variant?: 'subpage' | 'legal';
};

function ctaClassName(variant: PublicPageHeroCta['variant']): string {
  const base =
    'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-sm font-semibold transition-colors';
  switch (variant) {
    case 'signup':
      return `${base} bg-emerald-600 hover:bg-emerald-500 text-white`;
    case 'primary':
      return `${base} bg-blue-600 hover:bg-blue-500 text-white`;
    case 'secondary':
    default:
      return `${base} bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-white`;
  }
}

export function PublicPageHero({
  label,
  title,
  description,
  lastUpdated,
  ctas,
  stats,
  backLink,
  variant = 'subpage',
}: PublicPageHeroProps) {
  const padding = variant === 'legal' ? 'pt-32 pb-16' : 'pt-24 pb-16';

  return (
    <section className={`${padding} border-b border-zinc-800`}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="max-w-3xl">
          {backLink && (
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-400 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLink.label}
            </Link>
          )}
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
            {label}
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {title}
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed mb-4">{description}</p>
          {lastUpdated && (
            <p className="text-sm text-zinc-500 mb-6">Last updated: {lastUpdated}</p>
          )}
          {ctas && ctas.length > 0 && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
              {ctas.map((cta) => (
                <Link key={cta.href + cta.label} href={cta.href} className={ctaClassName(cta.variant)}>
                  {cta.variant === 'signup' && <UserPlus className="w-5 h-5" />}
                  {cta.label}
                </Link>
              ))}
            </div>
          )}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
