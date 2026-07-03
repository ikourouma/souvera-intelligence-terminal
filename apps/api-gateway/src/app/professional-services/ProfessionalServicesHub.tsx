'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Banknote,
  Briefcase,
  Code2,
  Compass,
  Cpu,
  Factory,
  Gem,
  Globe2,
  Layers,
  Network,
  Palmtree,
  Pickaxe,
  Rocket,
  Scale,
  Truck,
  Users,
  Wheat,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { SECTOR_PROFESSIONAL_SERVICES_CTA } from '@/data/sectors/sector-professional-services-cta';

const EXPERT_TEAMS: {
  step: string;
  title: string;
  role: string;
  description: string;
  deliverables: string[];
  icon: LucideIcon;
}[] = [
  {
    step: '01',
    title: 'Engagement lead',
    role: 'Program orchestration',
    description:
      'Orchestrates multi-market programs that unlock capital for governments, DFIs, and institutional partners — from scoping to measurable outcomes.',
    deliverables: [
      'Program scoping and stakeholder alignment',
      'Weekly progress cadence and milestone tracking',
      'Executive readouts and mission launch support',
    ],
    icon: Users,
  },
  {
    step: '02',
    title: 'Sector implementation consultant',
    role: 'Corridor & policy expertise',
    description:
      'Frontier-market specialists in AGOA, AfCFTA, CBI, sector licensing, and trade preference positioning — tailored to your corridor strategy.',
    deliverables: [
      'Corridor maps and preferential trade positioning',
      'Sector licensing and compliance pathway reviews',
      'Investor-ready briefing materials',
    ],
    icon: Compass,
  },
  {
    step: '03',
    title: 'Integration engineer',
    role: 'Data & API bridge',
    description:
      'Connects Souvera intelligence, APIs, and entitlements to your CRM, deal pipeline, and internal research workflows with governed data flows.',
    deliverables: [
      'API and entitlement integration planning',
      'Data handoff to CRM and deal pipelines',
      'Operational readiness and team training',
    ],
    icon: Code2,
  },
];

const JOURNEY_STEPS = [
  { step: '01', label: 'Engage' },
  { step: '02', label: 'Design' },
  { step: '03', label: 'Deliver' },
];

const SERVICE_PILLARS: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  icon: LucideIcon;
}[] = [
  {
    id: 'implementation',
    eyebrow: 'Get started quickly',
    title: 'Implementation services',
    description:
      'Hands-on guidance from strategy through launch — onboarding Souvera terminal access, API integration, entitlement rollout, and market coverage expansion.',
    bullets: [
      'Terminal and entitlement onboarding',
      'API and data integration strategies',
      'Market coverage expansion planning',
      'Operational readiness and team training',
    ],
    icon: Rocket,
  },
  {
    id: 'advisory',
    eyebrow: 'Optimize and grow',
    title: 'Advisory',
    description:
      'Strengthen your current intelligence workflow, expand into new corridors, and align risk and compliance narratives for institutional stakeholders.',
    bullets: [
      'Sector corridor and preferential trade strategy',
      'AGOA, AfCFTA, and CBI positioning',
      'Risk and compliance narrative alignment',
      'Investor and DFI engagement preparation',
    ],
    icon: Scale,
  },
  {
    id: 'strategy',
    eyebrow: 'Build for the future',
    title: 'Strategy & transformation',
    description:
      'Multi-market roadmaps, trade mission design, capital partner matching, and sovereign engagement programs that turn data into deployable capital.',
    bullets: [
      'Trade mission design and partner matching',
      'Multi-market investment roadmaps',
      'Sovereign and DFI engagement programs',
      'Capital formation and corridor activation',
    ],
    icon: Layers,
  },
];

const SECTOR_CARD_META: Record<
  string,
  { icon: LucideIcon; accent: string; accentText: string; label: string }
> = {
  fintech: { icon: Banknote, accent: 'rgba(59,130,246,0.15)', accentText: 'text-blue-400', label: 'Fintech' },
  energy: { icon: Zap, accent: 'rgba(34,197,94,0.15)', accentText: 'text-emerald-400', label: 'Energy' },
  logistics: { icon: Truck, accent: 'rgba(167,139,250,0.15)', accentText: 'text-violet-400', label: 'Logistics' },
  agriculture: { icon: Wheat, accent: 'rgba(16,185,129,0.15)', accentText: 'text-teal-400', label: 'Agriculture' },
  'critical-minerals': { icon: Gem, accent: 'rgba(217,119,6,0.15)', accentText: 'text-amber-400', label: 'Critical minerals' },
  'tourism-hospitality': { icon: Palmtree, accent: 'rgba(6,182,212,0.15)', accentText: 'text-cyan-400', label: 'Tourism' },
  'digital-infrastructure': { icon: Network, accent: 'rgba(139,92,246,0.15)', accentText: 'text-purple-400', label: 'Digital infrastructure' },
  technology: { icon: Cpu, accent: 'rgba(99,102,241,0.15)', accentText: 'text-indigo-400', label: 'Technology' },
  'manufacturing-textiles': { icon: Factory, accent: 'rgba(245,158,11,0.15)', accentText: 'text-amber-400', label: 'Manufacturing' },
  mining: { icon: Pickaxe, accent: 'rgba(234,88,12,0.15)', accentText: 'text-orange-400', label: 'Mining' },
};

export function ProfessionalServicesHub() {
  const contactHref = '/contact?intent=professional-services';

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      {/* Hero */}
      <section className="pt-28 pb-20 border-b border-zinc-800 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm mb-6 border border-blue-500/20 bg-blue-500/10">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-blue-300">
                Afronovation · Souvera
              </span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Turn intelligence into capital
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed mb-8">
              Souvera Professional Services helps partners move beyond dashboards — into trade missions,
              corridor activation, institutional onboarding, and capital-ready deal pipelines across 74
              African and Caribbean markets.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={contactHref}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-semibold"
              >
                Contact our team
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/platform"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-sm font-semibold"
              >
                Explore platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Expert teams */}
      <section className="py-20 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Expert teams to guide your Souvera journey
          </h2>
          <p className="text-zinc-500 mb-8 max-w-2xl">
            Implementation consultants and integration engineers combine frontier-market expertise with
            Souvera&apos;s governed intelligence stack — accelerating time to value for institutional partners.
          </p>

          <div className="hidden md:flex items-center gap-3 mb-10 max-w-xl">
            {JOURNEY_STEPS.map((item, i) => (
              <div key={item.step} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-blue-400">{item.step}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {item.label}
                  </span>
                </div>
                {i < JOURNEY_STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent min-w-[24px]" />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {EXPERT_TEAMS.map((team, index) => (
              <div
                key={team.title}
                className="group relative flex flex-col overflow-hidden p-6 bg-zinc-950 border border-zinc-800 rounded-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/30 animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12)_0%,transparent_65%)]" />
                <div className="relative flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-blue-400/80">{team.step}</span>
                    <div className="p-2.5 rounded-sm border border-zinc-800 bg-zinc-900/80 text-blue-400 group-hover:border-zinc-700 transition-colors">
                      <team.icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <p className="relative text-[10px] uppercase tracking-wider text-zinc-600 mb-1">{team.role}</p>
                <h3 className="relative text-lg font-bold mb-3 text-white">{team.title}</h3>
                <p className="relative text-sm text-zinc-400 leading-relaxed mb-5">{team.description}</p>
                <ul className="relative mt-auto space-y-2 border-t border-zinc-800/80 pt-4">
                  {team.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-zinc-500">
                      <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service pillars */}
      {SERVICE_PILLARS.map((pillar) => (
        <section key={pillar.id} id={pillar.id} className="py-20 border-b border-zinc-800 scroll-mt-24">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-400 mb-3">
              {pillar.eyebrow}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <pillar.icon className="w-10 h-10 text-blue-400 mb-4" />
                <h2
                  className="text-3xl font-bold mb-4"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {pillar.title}
                </h2>
                <p className="text-zinc-400 leading-relaxed">{pillar.description}</p>
              </div>
              <ul className="space-y-3">
                {pillar.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-3 text-sm text-zinc-300 border border-zinc-800 bg-zinc-950/50 px-4 py-3 rounded-sm"
                  >
                    <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      {/* Differentiation */}
      <section className="py-20 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <Globe2 className="w-10 h-10 text-emerald-400 mb-4" />
              <h2
                className="text-3xl font-bold mb-4"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Data plus execution
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Enterprise data providers deliver terminals, feeds, and analytics. Souvera Professional
                Services complements that stack with{' '}
                <strong className="text-white font-semibold">execution</strong> — helping Afronovation
                and Souvera partners convert 74-market intelligence into trade missions, corridor deals,
                and institutional capital programs.
              </p>
              <p className="text-sm text-zinc-500">
                Use Souvera for governed frontier-market intelligence. Engage Professional Services when
                you need partner-ready missions, not just another dashboard.
              </p>
            </div>
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm space-y-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-600">Complementary, not competitive</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-zinc-800 pb-3">
                  <span className="text-zinc-500">Enterprise data &amp; terminal</span>
                  <span className="text-zinc-300 text-right">Reference, pricing, risk feeds</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-zinc-800 pb-3">
                  <span className="text-zinc-500">Souvera intelligence platform</span>
                  <span className="text-zinc-300 text-right">74-market governed intelligence</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-blue-400 font-semibold">Souvera Professional Services</span>
                  <span className="text-white text-right font-medium">Missions · Corridors · Capital</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sector anchors */}
      <section className="py-20 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Sector expertise
          </h2>
          <p className="text-zinc-500 mb-10 max-w-2xl">
            Explore sector intelligence pages for tailored professional services — from fintech licensing to
            mining governance and AfCFTA manufacturing corridors.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {Object.values(SECTOR_PROFESSIONAL_SERVICES_CTA).map((sector, index) => {
              const meta = SECTOR_CARD_META[sector.slug] ?? {
                icon: Briefcase,
                accent: 'rgba(37,99,235,0.12)',
                accentText: 'text-blue-400',
                label: sector.slug.replace(/-/g, ' '),
              };
              const SectorIcon = meta.icon;
              const sectorHref = `/sectors/${sector.slug}`;

              return (
                <Link
                  key={sector.slug}
                  id={sector.slug}
                  href={sectorHref}
                  className={`
                    group relative flex flex-col overflow-hidden rounded-sm border border-zinc-800
                    bg-zinc-950 p-6 min-h-[220px] scroll-mt-24
                    transition-all duration-300 ease-out
                    hover:-translate-y-1 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/40
                    animate-fade-in-up
                  `}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at top right, ${meta.accent} 0%, transparent 65%)`,
                    }}
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-white/[0.02] to-transparent" />

                  <div className="relative flex items-start justify-between gap-3 mb-4">
                    <div className={`p-2.5 rounded-sm border border-zinc-800 bg-zinc-900/80 ${meta.accentText} group-hover:border-zinc-700 transition-colors`}>
                      <SectorIcon className="w-5 h-5" />
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${meta.accentText}`}
                    />
                  </div>

                  <div className="relative flex-1">
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${meta.accentText}`}>
                      {meta.label}
                    </p>
                    <h3 className="font-bold text-white mb-2 group-hover:text-zinc-100 transition-colors leading-snug">
                      {sector.headline}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 mb-4">
                      {sector.description}
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 mb-4">
                      {sector.highlight}
                    </p>
                  </div>

                  <span
                    className={`relative inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${meta.accentText} group-hover:gap-2.5 transition-all duration-300`}
                  >
                    Discuss {meta.label.toLowerCase()}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}

            {/* Cross-sector engagement — fills row 4 cols 2–3 beside Mining */}
            <div
              className="group relative flex flex-col overflow-hidden rounded-sm border border-blue-500/30 bg-gradient-to-br from-zinc-950 via-zinc-950 to-blue-950/40 p-6 sm:col-span-2 lg:col-span-2 min-h-[220px] transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-950/30 animate-fade-in-up"
              style={{ animationDelay: `${10 * 70}ms` }}
            >
              <div className="absolute inset-0 opacity-60 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18)_0%,transparent_60%)]" />
              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="p-2.5 rounded-sm border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">
                  Cross-sector programs
                </p>
                <h3
                  className="text-xl font-bold text-white mb-3 leading-snug"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Your mandate spans more than one sector
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6 flex-1">
                  Trade missions, institutional briefings, and corridor programs often cut across fintech,
                  energy, logistics, and mining. Afronovation helps scope, structure, and execute
                  multi-sector engagements.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <Link
                    href={contactHref}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-sm text-[11px] font-bold uppercase tracking-widest transition-colors"
                  >
                    Contact our team
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/sectors"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-zinc-300 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-colors"
                  >
                    Explore all sectors
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA — slim; primary conversion lives in sector grid */}
      <section className="py-16 border-t border-zinc-800/50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-zinc-500 text-sm text-center sm:text-left max-w-lg">
            Need institutional platform access alongside professional services? Explore enterprise plans
            and entitlement options.
          </p>
          <Link
            href="/access/institutional"
            className="shrink-0 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-white font-bold text-[11px] tracking-widest uppercase rounded-sm transition-colors"
          >
            Institutional access
          </Link>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
