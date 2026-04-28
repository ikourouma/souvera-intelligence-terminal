'use client';
import React from 'react';
import { ComplianceLayout } from '@/components/layout/ComplianceLayout';

const CONTENT = `
Last Updated: April 2026

At Souvera, we are committed to protecting your sovereign data and personal privacy. This policy outlines how we collect, use, and safeguard your information across our intelligence terminal and marketing gateway.

1. DATA COLLECTION
We collect information necessary to provide institutional-grade intelligence services, including identity nodes, professional affiliations, and platform interaction signals.

2. SOVEREIGN DATA PROTECTION
All macroeconomic and fiscal data processed by Souvera is subject to our "Sovereign-Grade" security protocols, ensuring data integrity and non-repudiation.

3. THIRD-PARTY DISCLOSURE
We do not sell your personal data. Information may be shared with institutional partners (IMF, World Bank) only as required for signal validation or platform maintenance.

For more information, please contact our Compliance Office at compliance@souvera.com.
`;

export default function PrivacyPolicyPage() {
  return <ComplianceLayout title="Privacy Policy" content={CONTENT} />;
}
