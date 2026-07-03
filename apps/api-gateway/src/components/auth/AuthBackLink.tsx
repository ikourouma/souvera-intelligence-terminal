import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AuthBackLinkProps {
  className?: string;
}

export function AuthBackLink({ className = '' }: AuthBackLinkProps) {
  return (
    <Link
      href="/intelligence"
      className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4 shrink-0" />
      Return to Intelligence
    </Link>
  );
}
