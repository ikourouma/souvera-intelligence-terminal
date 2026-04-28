'use client';
import React from 'react';
import { PresentationPageTemplate, PresentationContent } from '@/components/templates/PresentationPageTemplate';

const SECTOR_CONTENT: Record<string, PresentationContent> = {
  'energy': {
    title: 'Energy & Renewables.',
    tagline: 'Sovereign Energy Transition',
    what: {
      title: 'Powering the Future.',
      description: 'Tracking the continental transition from fossil baseloads to renewable energy nodes, including LNG, Green Hydrogen, and Solar clusters.',
      points: [
        'Green Hydrogen development tracking',
        'LNG export terminal capacity monitoring',
        'Solar & Wind grid integration signals',
        'Energy policy & subsidy transparency'
      ]
    },
    who: {
      title: 'For Utility & Infrastructure Capital.',
      description: 'Built for investors targeting the $2.8T African energy gap.',
      segments: [
        { name: 'IPP Developers', benefit: 'Identifying regions with favorable PPA frameworks.' },
        { name: 'Infrastructure Funds', benefit: 'Benchmarking grid stability and transmission risk.' },
        { name: 'Sovereign Wealth', benefit: 'Tracking energy security and export potential.' }
      ]
    },
    why: {
      title: 'The Energy Alpha.',
      description: 'Energy is the primary constraint to industrialization. Identifying where power is being unlocked is the primary signal for GDP growth.',
      impact: [
        { label: 'Project Nodes', value: '124 Active' },
        { label: 'CapEx Tracked', value: '$42B+' },
        { label: 'Signal Sync', value: 'Live' },
        { label: 'Reliability', value: '99.9%' }
      ]
    },
    how: {
      title: 'Deploying Energy Capital.',
      description: 'How to utilize energy signals for strategic site selection.',
      steps: [
        'Map Generation Nodes',
        'Audit Regulatory Pulse',
        'Verify Transmission Moats',
        'Initialize Investment'
      ]
    }
  },
  // Additional sectors will follow this pattern
};

import { use } from 'react';

export default function SectorDetailPage({ params }: { params: Promise<{ sector: string }> }) {
  const resolvedParams = use(params);
  const content = SECTOR_CONTENT[resolvedParams.sector] || SECTOR_CONTENT['energy'];
  return <PresentationPageTemplate content={content} />;
}
