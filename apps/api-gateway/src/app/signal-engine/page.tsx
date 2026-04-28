'use client';
import React from 'react';
import { PresentationPageTemplate, PresentationContent } from '@/components/templates/PresentationPageTemplate';

const CONTENT: PresentationContent = {
  title: 'The Signal Engine.',
  tagline: 'From Raw Data to Decision Alpha',
  what: {
    title: 'Predictive Sovereign Logic.',
    description: 'Our proprietary engine that normalizes disparate sovereign feeds and applies macroeconomic models to identify actionable signals.',
    points: [
      'Growth Volatility Scoring (GVS)',
      'Risk Trigger Alert System (RTAS)',
      'FDI Sentiment Normalization',
      'Transatlantic Corridor predictive modeling'
    ]
  },
  who: {
    title: 'For High-Frequency Strategists.',
    description: 'Designed for users who require real-time alerts on macroeconomic shifts.',
    segments: [
      { name: 'Hedge Funds', benefit: 'Identifying early-stage growth triggers in emerging nodes.' },
      { name: 'Risk Managers', benefit: 'Monitoring debt-to-GDP and inflation spikes in real-time.' },
      { name: 'Strategic Advisors', benefit: 'Providing evidence-based policy and investment guidance.' }
    ]
  },
  why: {
    title: 'The Edge of Anticipation.',
    description: 'In fast-moving markets, the speed of signal synthesis is the primary differentiator. Souvera reduces the lag between data ingestion and decision execution.',
    impact: [
      { label: 'Signal Velocity', value: '42ms' },
      { label: 'Predictive Accuracy', value: '94.2%' },
      { label: 'Normalized Nodes', value: '85,000+' },
      { label: 'Engine Tier', value: 'Institutional' }
    ]
  },
  how: {
    title: 'Harnessing the Signal.',
    description: 'Integrating predictive signals into your institutional workflow.',
    steps: [
      'Config Alert Thresholds',
      'Monitor Signal Stream',
      'Validate via Source Registry',
      'Execute Growth Thesis'
    ]
  }
};

export default function SignalEnginePage() {
  return <PresentationPageTemplate content={CONTENT} />;
}
