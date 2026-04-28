'use client';
import React from 'react';
import { PresentationPageTemplate, PresentationContent } from '@/components/templates/PresentationPageTemplate';

const CONTENT: PresentationContent = {
  title: 'Sector Intelligence.',
  tagline: 'Strategic Industry Vertical Tracking',
  what: {
    title: 'Drilling into the Growth Drivers.',
    description: 'A deep-dive intelligence layer focused on the primary industry verticals driving transatlantic economic expansion.',
    points: [
      'Energy & Critical Mineral signal tracking',
      'Fintech & Digital Infrastructure monitoring',
      'Agriculture & Agribusiness growth vectors',
      'Logistics & Blue Economy node auditing'
    ]
  },
  who: {
    title: 'For Industry Specialists.',
    description: 'Tailored intelligence for stakeholders focused on specific market verticals.',
    segments: [
      { name: 'Energy Investors', benefit: 'Monitoring LNG, oil, and renewable project signals.' },
      { name: 'Fintech Operators', benefit: 'Tracking regulatory shifts and digital adoption rates.' },
      { name: 'Trade Strategists', benefit: 'Analyzing supply chain risk and maritime node efficiency.' }
    ]
  },
  why: {
    title: 'Sector-Specific Conviction.',
    description: 'Macro data provides the context; sector intelligence provides the opportunity. Souvera identifies the specific nodes of industrial alpha.',
    impact: [
      { label: 'Sectors Tracked', value: '12 Verticals' },
      { label: 'Project Nodes', value: '450+' },
      { label: 'Growth Accuracy', value: '98.5%' },
      { label: 'Signals', value: 'Live' }
    ]
  },
  how: {
    title: 'Utilizing Vertical Signals.',
    description: 'How to integrate sector intelligence into your market entry model.',
    steps: [
      'Filter by Industry',
      'Analyze Growth Clusters',
      'Audit Regulatory Pulse',
      'Evaluate Entry Node'
    ]
  }
};

export default function SectorIntelligencePage() {
  return <PresentationPageTemplate content={CONTENT} />;
}
