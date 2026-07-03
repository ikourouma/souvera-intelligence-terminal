/**
 * AfCETA four protocol pillars — category and SDM sector mapping.
 */

import type { AfcetaPillarKey } from '@/lib/intelligence/afceta-types';

export const AFCETA_PILLARS: Record<
  AfcetaPillarKey,
  { title: string; subtitle: string; summary: string; categories: string[] }
> = {
  blue_maritime: {
    title: 'Blue & Maritime Economy',
    subtitle: 'Protocol on Maritime Logistics',
    summary:
      'Direct Atlantic corridors, port harmonization, and the Trans-Atlantic Maritime Network linking Tema, Durban, Lagos to Kingston, Port of Spain, and Bridgetown.',
    categories: ['machinery', 'vehicles', 'petroleum'],
  },
  digital_services: {
    title: 'Digital & Services Hub',
    subtitle: 'Protocol on Services, Tourism & Digital Trade',
    summary:
      'PAPSS/fintech interoperability, cultural economy framework, and mutual recognition for tourism, engineering, and professional services.',
    categories: ['electronics', 'textiles'],
  },
  diaspora_investment: {
    title: 'Diaspora Capital Base',
    subtitle: 'Protocol on Investment & Capital Mobility',
    summary:
      'AfCETA Diaspora Bond, investment protection, SME fast-track funding via Afreximbank and Caribbean Development Bank partnerships.',
    categories: ['machinery', 'minerals', 'vehicles'],
  },
  agriculture_climate: {
    title: 'Sustainable Agriculture & Climate',
    subtitle: 'Protocol on Food Security & Climate Resilience',
    summary:
      'Food security swaps — African grains and fertilizers for Caribbean sugar, rum, and agro-processing; joint climate-tech R&D.',
    categories: ['agriculture', 'chemicals'],
  },
};

export const CATEGORY_TO_DEMAND_GROUPS: Record<string, string[]> = {
  agriculture: ['grains', 'fertilizers', 'intermediate'],
  petroleum: ['intermediate'],
  minerals: ['machinery', 'intermediate'],
  machinery: ['machinery', 'transport'],
  textiles: ['cotton', 'textiles_inputs'],
  chemicals: ['fertilizers', 'pharma', 'intermediate'],
  vehicles: ['transport', 'machinery'],
  electronics: ['machinery', 'ict'],
};

export function pillarForCategory(categoryGroup: string): AfcetaPillarKey {
  for (const [key, pillar] of Object.entries(AFCETA_PILLARS)) {
    if (pillar.categories.includes(categoryGroup)) {
      return key as AfcetaPillarKey;
    }
  }
  return 'blue_maritime';
}
