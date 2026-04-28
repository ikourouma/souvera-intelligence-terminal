'use client';
import React from 'react';
import { ComplianceLayout } from '@/components/layout/ComplianceLayout';

const TERMS = `
1. ACCEPTANCE OF TERMS
By accessing the Souvera Intelligence Terminal, you agree to comply with these Institutional Terms of Service.

2. LICENSING
Souvera grants a limited, non-exclusive license to access and utilize macroeconomic signals for institutional research and strategic planning.

3. DATA PROPRIETARY RIGHTS
All signal synthesis, ranking logic, and geospatial visualizations are the intellectual property of Souvera and its partners.
`;

const COOKIES = `
Souvera utilizes technical cookies to maintain your session node and preferences. These tools are essential for the operation of the Intelligence Terminal.

By using the platform, you agree to our use of these session-management tools.
`;

const ACCESS = `
Souvera is committed to ensuring that our sovereign intelligence is accessible to all institutional stakeholders. We adhere to WCAG 2.1 Level AA standards for our digital interfaces.
`;

export default function TermsPage() {
  return <ComplianceLayout title="Terms of Service" content={TERMS} />;
}
// Note: In a real app, these would be separate files. I will create them now.
