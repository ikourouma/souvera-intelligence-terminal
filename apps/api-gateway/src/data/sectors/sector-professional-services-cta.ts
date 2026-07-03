export interface SectorProfessionalServicesCtaContent {
  slug: string;
  headline: string;
  description: string;
  highlight: string;
}

export const SECTOR_PROFESSIONAL_SERVICES_CTA: Record<string, SectorProfessionalServicesCtaContent> = {
  fintech: {
    slug: 'fintech',
    headline: 'From sandbox to scale',
    description:
      'Souvera Professional Services helps fintech operators navigate licensing corridors, investor readiness, and cross-border payment expansion across Africa and the Caribbean.',
    highlight: 'Licensing · Investor readiness · Corridor expansion',
  },
  energy: {
    slug: 'energy',
    headline: 'De-risk transition and IPP projects',
    description:
      'Our team supports bankability assessments, offtake corridor mapping, and sovereign energy transition due diligence — turning Souvera intelligence into investable project pipelines.',
    highlight: 'IPP bankability · Offtake corridors · Transition policy',
  },
  logistics: {
    slug: 'logistics',
    headline: 'Activate AfCFTA and port corridors',
    description:
      'Trade mission design, port concession diligence, and trade finance partner matching for operators scaling across West Africa, East Africa, and Caribbean transshipment hubs.',
    highlight: 'AfCFTA corridors · Port missions · Trade finance',
  },
  agriculture: {
    slug: 'agriculture',
    headline: 'Unlock agro-export market access',
    description:
      'Compliance mapping for AGOA and CBI preferences, cold-chain corridor strategy, and buyer matching for horticulture, cocoa, and specialty agro exports.',
    highlight: 'Export compliance · Cold chain · Buyer matching',
  },
  'critical-minerals': {
    slug: 'critical-minerals',
    headline: 'Structure EV supply chain deals',
    description:
      'Offtake partner diligence, concession governance reviews, and corridor activation for battery metals and processing investments tied to U.S. and EU supply chains.',
    highlight: 'Offtake matching · Concession diligence · EV corridors',
  },
  'tourism-hospitality': {
    slug: 'tourism-hospitality',
    headline: 'Attract FDI and airlift corridors',
    description:
      'Resort pipeline diligence, sovereign tourism policy alignment, and investor mission design for premium hospitality and mixed-use development across the Caribbean and Africa.',
    highlight: 'FDI attraction · Airlift strategy · Resort pipelines',
  },
  'digital-infrastructure': {
    slug: 'digital-infrastructure',
    headline: 'Structure fiber and datacenter PPPs',
    description:
      'Sovereign digital policy advisory, hyperscaler corridor mapping, and PPP structuring for fiber backbones, edge datacenters, and national broadband programs.',
    highlight: 'PPP structuring · Fiber corridors · Sovereign digital policy',
  },
  technology: {
    slug: 'technology',
    headline: 'Scale nearshore and venture pipelines',
    description:
      'Nearshore delivery corridor strategy, venture diligence support, and talent-market mapping for software exports from Lagos, Nairobi, Kingston, and emerging tech hubs.',
    highlight: 'Nearshore scaling · Venture diligence · Talent corridors',
  },
  'manufacturing-textiles': {
    slug: 'manufacturing-textiles',
    headline: 'Mission-ready factory corridors',
    description:
      'AGOA and CBI rules-of-origin advisory, SEZ site selection, and trade mission design for apparel, light manufacturing, and AfCFTA-linked production corridors.',
    highlight: 'Rules of origin · SEZ selection · Factory missions',
  },
  mining: {
    slug: 'mining',
    headline: 'Governance-first resource structuring',
    description:
      'Concession licensing diligence, community and ESG structuring, and capital partner matching for gold, bauxite, and industrial minerals across frontier jurisdictions.',
    highlight: 'Concession governance · ESG structuring · Capital matching',
  },
};

export function getSectorProfessionalServicesCta(slug: string): SectorProfessionalServicesCtaContent {
  return (
    SECTOR_PROFESSIONAL_SERVICES_CTA[slug] ?? {
      slug,
      headline: 'Turn intelligence into capital',
      description:
        'Souvera Professional Services helps institutional partners move from market analysis to trade missions, corridor activation, and capital-ready deal pipelines.',
      highlight: 'Trade missions · Corridor activation · Capital formation',
    }
  );
}
