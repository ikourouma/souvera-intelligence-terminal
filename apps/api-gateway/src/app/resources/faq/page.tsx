import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { HelpCircle, ArrowRight, ChevronDown } from 'lucide-react';
import { generateJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'FAQ | Souvera Intelligence Platform',
  description: 'Answers to common questions about Souvera: data sources, access plans, methodology, and enterprise solutions for African and Caribbean market intelligence.',
  openGraph: {
    title: 'FAQ | Souvera',
    description: 'Frequently asked questions about Souvera intelligence platform.',
    url: 'https://souvera.vercel.app/resources/faq',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/resources/faq',
  },
};

const FAQ_CATEGORIES = [
  {
    category: 'About Souvera',
    questions: [
      {
        q: 'What is Souvera?',
        a: 'Souvera is an institutional-grade intelligence platform for African and Caribbean markets. We aggregate macroeconomic data from official sources including the IMF, World Bank, and regional development banks to provide decision-ready intelligence for governments, development finance institutions, investors, and enterprises.',
      },
      {
        q: 'Who builds Souvera?',
        a: 'Souvera is engineered by Afronovation, Inc., a technology company focused on building infrastructure for African and Caribbean market transparency.',
      },
      {
        q: 'Who is Souvera designed for?',
        a: 'Souvera is designed for institutional users including development finance institutions, government economic advisors, investment funds, corporate strategy teams, and research organizations requiring rigorous data standards for African and Caribbean markets.',
      },
    ],
  },
  {
    category: 'Data & Methodology',
    questions: [
      {
        q: 'Where does Souvera\'s data come from?',
        a: 'Our primary data sources are international institutions including the International Monetary Fund (IMF), World Bank, United Nations (UNCTAD), African Development Bank, Caribbean Development Bank, and official national statistical agencies. Every data point carries source attribution.',
      },
      {
        q: 'How often is data updated?',
        a: 'Macroeconomic indicators are updated as official sources publish new data, typically quarterly or annually depending on the metric and source. We do not claim high-frequency updates unless connected to live monitoring systems.',
      },
      {
        q: 'Does Souvera use AI?',
        a: 'Yes, Souvera uses governed AI-assisted analysis to support anomaly detection, source comparison, signal clustering, and executive briefing preparation. AI outputs are reviewed before publication and never replace official source data. AI does not make autonomous decisions or guarantee predictions.',
      },
      {
        q: 'How does Souvera handle data gaps?',
        a: 'We acknowledge data gaps common in emerging markets. When official data is unavailable or outdated, we clearly indicate this rather than presenting estimates as confirmed figures. Sources with incomplete coverage are marked as "Partial" status in our source registry.',
      },
    ],
  },
  {
    category: 'Access & Pricing',
    questions: [
      {
        q: 'How do I request access?',
        a: 'Visit our Request Access page to submit an access request. Our team reviews requests and responds within 2 business days to discuss your requirements and appropriate access tier.',
      },
      {
        q: 'What access tiers are available?',
        a: 'We offer four tiers: Explorer (public data and country profiles), Professional (extended indicators and historical data), Business (bulk access and downloads), and Institutional (full API access and custom solutions). Each tier includes increasing depth and capabilities.',
      },
      {
        q: 'Is there a free tier?',
        a: 'The Explorer tier provides access to public macroeconomic data at no cost. It includes country profiles, market signals, and regional intelligence summaries. Request access to explore available data.',
      },
      {
        q: 'How do enterprise plans work?',
        a: 'Enterprise and institutional plans are customized based on your organization\'s needs. This includes API access, custom endpoints, dedicated support, and SLA options. Contact us to discuss enterprise requirements.',
      },
    ],
  },
  {
    category: 'Security & Compliance',
    questions: [
      {
        q: 'How is my data protected?',
        a: 'Souvera is hosted on enterprise-grade infrastructure (Vercel) with industry-standard security practices. Our database (Supabase) implements row-level security. User data is encrypted in transit and at rest. We collect only essential information for account management.',
      },
      {
        q: 'Does Souvera sell user data?',
        a: 'No. We do not sell user data to third parties. We implement GDPR-aware practices and maintain clear privacy policies.',
      },
      {
        q: 'Is Souvera GDPR compliant?',
        a: 'We implement GDPR-aware practices including minimal PII collection, transparent privacy policies, user data access controls, and no third-party data sales. Enterprise security documentation is available on request for institutional partners.',
      },
    ],
  },
  {
    category: 'Platform & Features',
    questions: [
      {
        q: 'What markets does Souvera cover?',
        a: 'Souvera covers 50+ African and Caribbean markets with varying depth. Coverage includes macroeconomic indicators, sector analysis, and market signals. Country-specific data availability varies based on official source coverage.',
      },
      {
        q: 'Is API access available?',
        a: 'Yes. API access is available across Professional, Business, and Institutional tiers with increasing capabilities and rate limits. Institutional partners receive dedicated onboarding and custom endpoint development. Contact us to discuss API access.',
      },
      {
        q: 'Can I export data?',
        a: 'Data export capabilities are available in Business and Institutional tiers. Export formats and frequency depend on your access tier and use case.',
      },
    ],
  },
];

// JSON-LD for FAQ
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_CATEGORIES.flatMap(cat => 
    cat.questions.map(q => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.a,
      },
    }))
  ),
};

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLd(faqSchema) }}
      />
      <SouveraMegaNav />

      <section className="pt-24 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Resources
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Frequently Asked Questions.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Questions answered. Find answers to common questions about Souvera, our data, and how institutions can access our intelligence.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto space-y-16">
            {FAQ_CATEGORIES.map((category) => (
              <div key={category.category}>
                <h2
                  className="text-2xl font-bold mb-8"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {category.category}
                </h2>
                <div className="space-y-6">
                  {category.questions.map((item) => (
                    <div
                      key={item.q}
                      className="p-6 bg-[#121821] border border-zinc-800 rounded-sm"
                    >
                      <h3 className="text-lg font-bold mb-3 text-white">
                        {item.q}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-zinc-800 bg-[#121821]/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Still Have Questions?
            </h2>
            <p className="text-zinc-400 mb-8">
              If you don&apos;t see your question answered, please contact us. Our team is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                Contact Us
              </Link>
              <Link
                href="/access/request-access"
                className="px-10 py-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
