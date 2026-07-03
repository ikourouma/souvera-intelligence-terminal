import type { ReactNode } from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { PublicPageHero } from '@/components/marketing/PublicPageHero';
import { LegalDocumentPager, type LegalSection } from '@/components/legal/LegalDocumentPager';

interface Props {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
  children?: ReactNode;
}

export function ComplianceLayout({ title, description, lastUpdated, sections }: Props) {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      <PublicPageHero
        variant="legal"
        label="Legal"
        title={title}
        description={description}
        lastUpdated={lastUpdated}
      />
      <section className="py-16 border-b border-zinc-800">
        <LegalDocumentPager sections={sections} />
      </section>
      <SouveraFooter />
    </main>
  );
}

export type { LegalSection };
