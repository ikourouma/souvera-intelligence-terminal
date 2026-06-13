import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';

interface TradeLayoutProps {
  children: React.ReactNode;
}

export default function TradeLayout({ children }: TradeLayoutProps) {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      <div className="pt-20">{children}</div>
      <SouveraFooter />
    </main>
  );
}
