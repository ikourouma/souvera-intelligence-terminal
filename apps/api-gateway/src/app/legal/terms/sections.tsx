import Link from 'next/link';
import type { LegalSection } from '@/components/layout/ComplianceLayout';

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: '1. Acceptance of Terms',
    content: (
      <p>
        These Terms of Service (&quot;Terms&quot;) govern access to the Souvera Intelligence Terminal
        and related websites, APIs, and services (collectively, the &quot;Platform&quot;) operated by
        Afronovation, Inc. (&quot;Souvera&quot;, &quot;we&quot;, &quot;us&quot;). By creating an account,
        requesting access, or using the Platform, you agree to these Terms and our{' '}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    title: '2. Eligibility and Accounts',
    content: (
      <>
        <p>
          You must provide accurate registration information and maintain the security of your credentials.
          You are responsible for activity under your account. Notify us immediately of unauthorized use
          at <a href="mailto:compliance@souvera.com">compliance@souvera.com</a>.
        </p>
        <p>
          Explorer accounts are available via self-serve registration at{' '}
          <Link href="/signup">/signup</Link>. Business and institutional tiers require approved access
          requests.
        </p>
      </>
    ),
  },
  {
    title: '3. Access Tiers and Services',
    content: (
      <>
        <p>Souvera offers tiered access including, without limitation:</p>
        <ul>
          <li><strong>Explorer (free):</strong> country profiles, intelligence map, and basic indicators</li>
          <li><strong>Professional:</strong> extended indicators, compare tools, and increased limits</li>
          <li><strong>Business:</strong> trade intelligence modules, exports, and team features</li>
          <li><strong>Institutional:</strong> API access, custom endpoints, and enterprise support</li>
        </ul>
        <p>
          Feature availability, data depth, and rate limits vary by tier. We may modify tier features
          with reasonable notice where practicable.
        </p>
      </>
    ),
  },
  {
    title: '4. Acceptable Use',
    content: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Scrape, bulk harvest, or resell Platform data without written authorization</li>
          <li>Circumvent access controls, tier gates, or authentication mechanisms</li>
          <li>Reverse engineer ranking logic, signal models, or proprietary visualizations</li>
          <li>Use the Platform for unlawful, fraudulent, or harmful purposes</li>
          <li>Misrepresent Souvera data as official government publication without attribution</li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Intellectual Property',
    content: (
      <>
        <p>
          Souvera owns the Platform, including signal synthesis, ranking methodologies, user interface,
          documentation, and compiled datasets presented through the terminal. Third-party source data
          remains subject to respective provider terms documented on our{' '}
          <Link href="/resources/data-sources">data sources page</Link>.
        </p>
        <p>
          We grant you a limited, non-exclusive, non-transferable license to access and use Platform
          content for internal research and decision support according to your access tier.
        </p>
      </>
    ),
  },
  {
    title: '6. Data and Attribution',
    content: (
      <p>
        Intelligence presented on Souvera combines official institutional feeds with editorial
        curation and governed analytical models. Data confidence tiers (confirmed, estimated, projected)
        are labelled where applicable. See{' '}
        <Link href="/insights/methodology">methodology</Link> for how we source and validate information.
      </p>
    ),
  },
  {
    title: '7. Disclaimers',
    content: (
      <>
        <p>
          THE PLATFORM IS PROVIDED &quot;AS IS&quot; FOR INFORMATIONAL PURPOSES. SOUVERA DOES NOT PROVIDE
          INVESTMENT, LEGAL, TAX, OR TRADING ADVICE. SIGNALS, SCORES, AND ANALYSIS DO NOT CONSTITUTE
          RECOMMENDATIONS OR ENDORSEMENTS. YOU ARE SOLELY RESPONSIBLE FOR YOUR DECISIONS AND DUE DILIGENCE.
        </p>
        <p>
          We do not guarantee completeness, accuracy, timeliness, or uninterrupted availability of any
          data or feature. Official source publication lags apply to trade statistics as documented publicly.
        </p>
      </>
    ),
  },
  {
    title: '8. Limitation of Liability',
    content: (
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOUVERA AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY
        INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA,
        OR GOODWILL, ARISING FROM YOUR USE OF THE PLATFORM. OUR AGGREGATE LIABILITY FOR DIRECT DAMAGES
        SHALL NOT EXCEED THE FEES PAID BY YOU IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED
        US DOLLARS ($100) IF NO FEES WERE PAID.
      </p>
    ),
  },
  {
    title: '9. Termination',
    content: (
      <p>
        You may stop using the Platform at any time. We may suspend or terminate access for violation
        of these Terms, non-payment of applicable fees, or to protect platform integrity. Provisions that
        by nature should survive termination (IP, disclaimers, liability limits) will survive.
      </p>
    ),
  },
  {
    title: '10. Governing Law',
    content: (
      <p>
        These Terms are governed by the laws of the State of Delaware, United States, without regard to
        conflict-of-law principles. Disputes shall be resolved in courts located in Delaware, except
        where mandatory consumer protection laws in your jurisdiction provide otherwise.
      </p>
    ),
  },
  {
    title: '11. Changes to Terms',
    content: (
      <p>
        We may update these Terms by posting a revised version with an updated &quot;Last updated&quot;
        date. Material changes to paid tiers will be communicated where required. Continued use after
        changes constitutes acceptance.
      </p>
    ),
  },
  {
    title: '12. Contact',
    content: (
      <>
        <p>
          Afronovation, Inc.
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
