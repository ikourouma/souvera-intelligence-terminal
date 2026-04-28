'use client';
import React from 'react';
import { PresentationPageTemplate, PresentationContent } from '@/components/templates/PresentationPageTemplate';

const CONTENT: PresentationContent = {
  title: 'Data Sources & Methodology.',
  tagline: 'Sovereign-Grade Integrity',
  what: {
    title: 'The Foundation of Truth.',
    description: 'A multi-layered data ingestion pipeline that normalizes global macroeconomic signals into a unified institutional schema.',
    points: [
      'Direct node integration with IMF & World Bank',
      'UN Statistical Division data ingestion',
      'OECD & BIS policy signal monitoring',
      'ILOSTAT labour market trend analysis'
    ]
  },
  who: {
    title: 'For Technical Decision-Makers.',
    description: 'Providing data scientists and fund managers with absolute transparency into signal origin.',
    segments: [
      { name: 'Quant Funds', benefit: 'Accessing clean, normalized macroeconomic time-series data.' },
      { name: 'Risk Officers', benefit: 'Validating signal triggers against sovereign-source repositories.' },
      { name: 'Policy Analysts', benefit: 'Utilizing benchmarked data for comparative fiscal study.' }
    ]
  },
  why: {
    title: 'Why Sovereign-Grade Matters.',
    description: 'In an era of misinformation, Souvera anchors every signal in objective, audited sovereign truth.',
    impact: [
      { label: 'Primary Sources', value: '12 Global' },
      { label: 'Indicator Keys', value: '8,500+' },
      { label: 'Validation Layers', value: 'Dual-Audit' },
      { label: 'Reliability', value: 'Institutional' }
    ]
  },
  how: {
    title: 'The Intelligence Loop.',
    description: 'How raw data is transformed into strategic decision alpha.',
    steps: [
      'Source Ingestion',
      'Signal Normalization',
      'Analyst Verification',
      'Terminal Promotion'
    ]
  }
};

export default function MethodologyPage() {
  return <PresentationPageTemplate content={CONTENT} />;
}
