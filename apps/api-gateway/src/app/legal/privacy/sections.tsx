import Link from 'next/link';
import type { LegalSection } from '@/components/layout/ComplianceLayout';

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: '1. Introduction',
    content: (
      <>
        <p>
          Afronovation, Inc. (&quot;Souvera&quot;, &quot;we&quot;, &quot;us&quot;) operates the Souvera Intelligence
          Terminal and related services at souvera.vercel.app. This Privacy Policy explains how we handle
          personal information when you create an account, browse public pages, or use platform features.
        </p>
        <p>
          By using Souvera, you acknowledge this policy. If you do not agree, please do not use the
          platform. For questions, contact{' '}
          <a href="mailto:compliance@souvera.com">compliance@souvera.com</a>.
        </p>
      </>
    ),
  },
  {
    title: '2. Information We Collect',
    content: (
      <>
        <p>We may collect the following categories of information:</p>
        <ul>
          <li>
            <strong>Account information:</strong> name, email address, organization, job title, and
            authentication credentials when you register or are invited.
          </li>
          <li>
            <strong>Usage information:</strong> pages viewed, features accessed, session timestamps,
            and interaction signals needed to operate and improve the service.
          </li>
          <li>
            <strong>Professional context:</strong> organization type, access tier, and preferences you
            provide during onboarding or access requests.
          </li>
          <li>
            <strong>Technical information:</strong> IP address, browser type, device identifiers, and
            cookies required for session management and security.
          </li>
        </ul>
        <p>
          We do not require sensitive personal data (health, biometric, or government ID) to use Explorer
          or standard platform tiers.
        </p>
      </>
    ),
  },
  {
    title: '3. How We Use Information',
    content: (
      <>
        <p>We use personal information to:</p>
        <ul>
          <li>Provide, authenticate, and maintain your account and access tier</li>
          <li>Deliver intelligence features, saved views, and tier-gated content</li>
          <li>Respond to support requests and access inquiries</li>
          <li>Monitor platform security, prevent abuse, and comply with legal obligations</li>
          <li>Improve product performance and user experience through aggregated analytics</li>
        </ul>
        <p>
          We do not sell personal information. We do not use your account data to train public AI models
          without explicit consent.
        </p>
      </>
    ),
  },
  {
    title: '4. Legal Bases (EEA/UK Users)',
    content: (
      <>
        <p>Where GDPR or UK GDPR applies, we process personal data on the following bases:</p>
        <ul>
          <li><strong>Contract:</strong> to provide the service you signed up for</li>
          <li><strong>Legitimate interests:</strong> security, fraud prevention, and product improvement</li>
          <li><strong>Consent:</strong> where required for optional communications or non-essential cookies</li>
          <li><strong>Legal obligation:</strong> where we must retain or disclose data by law</li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Data Sharing',
    content: (
      <>
        <p>We may share information with:</p>
        <ul>
          <li>
            <strong>Infrastructure providers:</strong> hosting, authentication, email delivery, and
            analytics subprocessors bound by data processing agreements
          </li>
          <li><strong>Professional advisors:</strong> lawyers, auditors, or insurers where necessary</li>
          <li><strong>Authorities:</strong> when required by valid legal process</li>
        </ul>
        <p>
          Macroeconomic and trade data displayed in Souvera comes from third-party institutional sources
          documented on our{' '}
          <Link href="/resources/data-sources">data sources page</Link>. That public data is not your
          personal information.
        </p>
      </>
    ),
  },
  {
    title: '6. Retention',
    content: (
      <p>
        We retain account and usage records for as long as your account is active and for a reasonable
        period thereafter to comply with legal, tax, and audit requirements. You may request deletion
        subject to exceptions where retention is required by law or legitimate business need.
      </p>
    ),
  },
  {
    title: '7. Security',
    content: (
      <p>
        We apply industry-standard technical and organizational measures including encrypted transport
        (TLS), access controls, and tier-gated data presentation. No system is completely secure; report
        concerns to <a href="mailto:compliance@souvera.com">compliance@souvera.com</a>.
      </p>
    ),
  },
  {
    title: '8. International Transfers',
    content: (
      <p>
        Souvera may process data in the United States and other jurisdictions where our subprocessors
        operate. Where required, we use appropriate safeguards such as Standard Contractual Clauses for
        transfers from the EEA or UK.
      </p>
    ),
  },
  {
    title: '9. Your Rights',
    content: (
      <>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access a copy of personal information we hold about you</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion or restriction of processing</li>
          <li>Object to certain processing or withdraw consent</li>
          <li>Request data portability in a structured format</li>
          <li>Lodge a complaint with your local supervisory authority</li>
        </ul>
        <p>
          To exercise these rights, email{' '}
          <a href="mailto:compliance@souvera.com">compliance@souvera.com</a>. We respond within applicable
          statutory timeframes.
        </p>
      </>
    ),
  },
  {
    title: '10. Cookies',
    content: (
      <p>
        We use essential cookies for authentication and session management. See our{' '}
        <Link href="/legal/cookies">Cookie Policy</Link> for details on cookies and how to manage
        preferences.
      </p>
    ),
  },
  {
    title: '11. Changes to This Policy',
    content: (
      <p>
        We may update this Privacy Policy from time to time. Material changes will be reflected by
        updating the &quot;Last updated&quot; date above. Continued use after changes constitutes
        acceptance of the revised policy.
      </p>
    ),
  },
  {
    title: '12. Contact',
    content: (
      <>
        <p>
          Data controller: Afronovation, Inc.
          <br />
          Email: <a href="mailto:compliance@souvera.com">compliance@souvera.com</a>
        </p>
        <p className="text-sm text-zinc-500 not-prose">
          This document is an institutional template. Organizations requiring counsel review should
          consult qualified legal advisors before relying on it for regulatory compliance.
        </p>
      </>
    ),
  },
];
