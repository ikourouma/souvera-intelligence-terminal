import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium'],
  
  async redirects() {
    return [
      // Legacy terminal routes → new intelligence structure
      { source: '/terminal/africa', destination: '/intelligence/africa', permanent: true },
      { source: '/terminal/africa/map', destination: '/intelligence/map', permanent: true },
      { source: '/terminal', destination: '/intelligence/africa', permanent: true },
      { source: '/terminal/sectors', destination: '/sectors', permanent: true },
      { source: '/terminal/economies', destination: '/intelligence/africa', permanent: true },
      { source: '/terminal/caribbean/economies', destination: '/intelligence/caribbean', permanent: true },
      { source: '/terminal/countries', destination: '/intelligence/africa', permanent: true },
      { source: '/terminal/compare', destination: '/intelligence/compare', permanent: true },
      { source: '/terminal/map', destination: '/intelligence/map', permanent: true },
      { source: '/terminal/caribbean', destination: '/intelligence/caribbean', permanent: true },
      // Legacy terminal-web root paths (pre–single-host migration)
      { source: '/africa/map', destination: '/intelligence/map', permanent: true },
      { source: '/caribbean/map', destination: '/intelligence/caribbean', permanent: true },
      { source: '/africa/economies', destination: '/insights/rankings', permanent: true },
      { source: '/caribbean/economies', destination: '/insights/rankings', permanent: true },
      { source: '/africa', destination: '/intelligence/africa', permanent: true },
      { source: '/caribbean', destination: '/intelligence/caribbean', permanent: true },
      { source: '/terminal/reports', destination: '/insights/briefings', permanent: true },
      { source: '/terminal/signals', destination: '/platform/signal-engine', permanent: true },
      
      // Legacy data/signal routes
      { source: '/signals', destination: '/platform/signal-engine', permanent: true },
      { source: '/signal-engine', destination: '/platform/signal-engine', permanent: true },
      { source: '/data', destination: '/resources/data-sources', permanent: true },
      { source: '/Data-Sources-&-Methodology', destination: '/resources/data-sources', permanent: true },
      { source: '/methodology', destination: '/insights/methodology', permanent: true },
      { source: '/source-registry', destination: '/resources/source-registry', permanent: true },
      
      // Legacy access/subscription routes
      { source: '/subscriptions', destination: '/access', permanent: true },
      { source: '/pricing', destination: '/access', permanent: true },
      
      // Legacy API/docs routes
      { source: '/api-docs', destination: '/platform/api', permanent: true },
      { source: '/api-documentation', destination: '/platform/api', permanent: true },
      { source: '/docs/api', destination: '/platform/api', permanent: true },
      
      // Legacy command center routes
      { source: '/africa-command-center', destination: '/intelligence/africa', permanent: true },
      { source: '/caribbean-command-center', destination: '/intelligence/caribbean', permanent: true },
      { source: '/intelligence-map', destination: '/intelligence/map', permanent: true },
      
      // Legacy sector routes → new clean URLs
      { source: '/sector-intelligence', destination: '/sectors', permanent: true },
      { source: '/sector/energy-&-renewables', destination: '/sectors/energy', permanent: true },
      { source: '/sector/mining-&-critical-minerals', destination: '/sectors/critical-minerals', permanent: true },
      { source: '/sector/fintech-&-digital-finance', destination: '/sectors/fintech', permanent: true },
      { source: '/sector/tourism-&-hospitality', destination: '/sectors/tourism-hospitality', permanent: true },
      { source: '/sectors/tourism', destination: '/sectors/tourism-hospitality', permanent: true },
      { source: '/sector/logistics-&-trade', destination: '/sectors/logistics', permanent: true },
      { source: '/sector/:sector', destination: '/sectors/:sector', permanent: true },
      
      // Legacy compliance/legal routes
      { source: '/compliance-hub', destination: '/resources/compliance', permanent: true },
      { source: '/compliance/privacy-policy', destination: '/legal/privacy', permanent: true },
      { source: '/compliance/terms-of-service', destination: '/legal/terms', permanent: true },
      { source: '/compliance/cookie-policy', destination: '/legal/cookies', permanent: true },
      { source: '/compliance/accessibility', destination: '/legal/accessibility', permanent: true },
      
      // Legacy resource routes
      { source: '/faqs', destination: '/resources/faq', permanent: true },
      { source: '/solutions', destination: '/access/institutional', permanent: true },
      
      // Legacy press/media
      { source: '/press-&-media', destination: '/about', permanent: true },
      
      // Auth routes - redirect legacy patterns
      { source: '/register', destination: '/access/request-access', permanent: true },
      { source: '/forgot', destination: '/auth/forgot-password', permanent: true },
      { source: '/forgot-password', destination: '/auth/forgot-password', permanent: true },
      { source: '/reset-password', destination: '/auth/reset-password', permanent: true },
    ];
  },
};

export default nextConfig;
