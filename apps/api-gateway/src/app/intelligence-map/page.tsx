'use client';
import React from 'react';
import { PresentationPageTemplate, PresentationContent } from '@/components/templates/PresentationPageTemplate';

const CONTENT: PresentationContent = {
  title: 'Intelligence Map Briefing.',
  tagline: 'Geospatial Sovereign Insights',
  what: {
    title: 'Visualizing Economic Corridors.',
    description: 'A high-fidelity geospatial engine that translates raw macroeconomic data into interactive trade-flow and risk visualizations.',
    points: [
      'Interactive 54-nation Africa node',
      'CARICOM trade corridor mapping',
      'Real-time policy-shift pulse indicators',
      'Granular country-brief overlays'
    ]
  },
  who: {
    title: 'For Geospatial Analysts.',
    description: 'Providing a spatial context to sovereign macroeconomic trends.',
    segments: [
      { name: 'Policy Architects', benefit: 'Mapping regional development against trade-flow signals.' },
      { name: 'FDI Strategists', benefit: 'Identifying geographic growth clusters and infrastructure hubs.' },
      { name: 'Logistics Firms', benefit: 'Monitoring maritime and trade node efficiency.' }
    ]
  },
  why: {
    title: 'The Power of Spatial Intelligence.',
    description: 'Data without context is noise. Souvera’s maps provide the spatial dimension required for regional market entry strategy.',
    impact: [
      { label: 'Interactive Nations', value: '74+' },
      { label: 'Visual Signal Nodes', value: '150+' },
      { label: 'Update Frequency', value: 'Pulse' },
      { label: 'Accuracy', value: 'Geospatial' }
    ]
  },
  how: {
    title: 'Mapping Your Growth.',
    description: 'How to utilize the geospatial terminal for market research.',
    steps: [
      'Initialize Global View',
      'Select Regional Node',
      'Analyze Signal Overlays',
      'Export Geospatial Brief'
    ]
  }
};

export default function IntelligenceMapPage() {
  return <PresentationPageTemplate content={CONTENT} />;
}
