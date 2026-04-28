'use client';
import React from 'react';
import { PresentationPageTemplate, PresentationContent } from '@/components/templates/PresentationPageTemplate';

const CONTENT: PresentationContent = {
  title: 'API Documentation.',
  tagline: 'Direct Institutional Integration',
  what: {
    title: 'The Data Pipeline Gateway.',
    description: 'A robust, RESTful and WebSocket-enabled gateway for direct integration of Souvera intelligence into your proprietary systems.',
    points: [
      'High-frequency data streaming nodes',
      'Full macroeconomic time-series access',
      'Real-time signal alert webhooks',
      'Institutional-grade security & encryption'
    ]
  },
  who: {
    title: 'For Developers & Data Scientists.',
    description: 'Empowering technical teams to build custom models on sovereign-grade data.',
    segments: [
      { name: 'Quant Desks', benefit: 'Direct ingestion into algorithmic trading models.' },
      { name: 'Fintech Platforms', benefit: 'Powering regional market data visualizations.' },
      { name: 'Policy Researchers', benefit: 'Accessing normalized cross-border datasets for analysis.' }
    ]
  },
  why: {
    title: 'Precision at Scale.',
    description: 'Manual data collection is a thing of the past. The Souvera API provides the scale and precision required for modern financial modeling.',
    impact: [
      { label: 'Endpoints', value: '142+' },
      { label: 'Uptime Score', value: '99.99%' },
      { label: 'Data Latency', value: '<50ms' },
      { label: 'Auth Tier', value: 'Enterprise' }
    ]
  },
  how: {
    title: 'System Integration.',
    description: 'How to initialize your institutional data bridge.',
    steps: [
      'Generate API Credentials',
      'Select Data Endpoints',
      'Initialize Stream Node',
      'Sync Internal Models'
    ]
  }
};

export default function APIDocsPage() {
  return <PresentationPageTemplate content={CONTENT} />;
}
