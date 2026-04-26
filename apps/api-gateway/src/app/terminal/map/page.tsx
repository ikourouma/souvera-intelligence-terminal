'use client';

import React, { useState } from 'react';
import { TerminalShell } from '@/components/layout/TerminalShell';
import IntelligentMap from '@/components/map/IntelligentMap';
import { CountryIntelligencePanel } from '@/components/panels/CountryIntelligencePanel';

// Mock data for demonstration - in production this comes from /api/v1/country-lite
const MOCK_COUNTRIES: Record<string, any> = {
  ZMB: {
    iso3: 'ZMB',
    name: 'Zambia',
    region: 'South-Central Africa',
    flagUrl: 'https://flagcdn.com/zm.svg',
    signal: 'high_growth',
    metrics: { gdp: '$21.2B', growth: 4.7, population: '19.4M' }
  },
  NGA: {
    iso3: 'NGA',
    name: 'Nigeria',
    region: 'West Africa',
    flagUrl: 'https://flagcdn.com/ng.svg',
    signal: 'emerging',
    metrics: { gdp: '$440.8B', growth: 3.2, population: '213.4M' }
  },
  KEN: {
    iso3: 'KEN',
    name: 'Kenya',
    region: 'East Africa',
    flagUrl: 'https://flagcdn.com/ke.svg',
    signal: 'high_growth',
    metrics: { gdp: '$110.3B', growth: 5.5, population: '53.7M' }
  },
  JAM: {
    iso3: 'JAM',
    name: 'Jamaica',
    region: 'Caribbean',
    flagUrl: 'https://flagcdn.com/jm.svg',
    signal: 'high_growth',
    metrics: { gdp: '$14.6B', growth: 4.2, population: '2.8M' }
  },
  BRB: {
    iso3: 'BRB',
    name: 'Barbados',
    region: 'Caribbean',
    flagUrl: 'https://flagcdn.com/bb.svg',
    signal: 'emerging',
    metrics: { gdp: '$4.9B', growth: 2.1, population: '0.28M' }
  },
  KNA: {
    iso3: 'KNA',
    name: 'St. Kitts & Nevis',
    region: 'Caribbean',
    flagUrl: 'https://flagcdn.com/kn.svg',
    signal: 'high_growth',
    metrics: { gdp: '$1.0B', growth: 3.8, population: '0.05M' }
  }
};

export default function TerminalMapPage() {
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);

  const selectedCountry = selectedCountryId ? MOCK_COUNTRIES[selectedCountryId] : null;

  return (
    <TerminalShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Africa Intelligence Command</h2>
          <p className="text-text-secondary text-sm">Select a market to view live signal momentum and macroeconomic drill-downs.</p>
        </div>

        <div className="relative">
          <IntelligentMap onSelect={(id) => setSelectedCountryId(id)} />
          
          {selectedCountry && (
            <CountryIntelligencePanel 
              country={selectedCountry} 
              onClose={() => setSelectedCountryId(null)} 
            />
          )}
        </div>
      </div>
    </TerminalShell>
  );
}
