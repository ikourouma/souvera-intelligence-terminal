import type { Metadata } from 'next';
import { AuthBackLink } from '@/components/auth/AuthBackLink';

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed top-8 left-8 z-50">
        <AuthBackLink className="text-zinc-400 hover:text-white drop-shadow-sm" />
      </div>
      {children}
    </>
  );
}
