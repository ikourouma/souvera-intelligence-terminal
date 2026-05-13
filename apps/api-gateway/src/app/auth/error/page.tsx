import Link from 'next/link';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication Error | Souvera',
  description: 'An error occurred during authentication.',
};

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  auth_callback_error: {
    title: 'Authentication Failed',
    description: 'We could not complete the sign-in process. The link may have expired or already been used.',
  },
  verification_failed: {
    title: 'Verification Failed',
    description: 'We could not verify your email address. The verification link may have expired.',
  },
  invitation_expired: {
    title: 'Invitation Expired',
    description: 'This invitation link has expired. Please contact your organization administrator for a new invitation.',
  },
  access_denied: {
    title: 'Access Denied',
    description: 'You do not have permission to access this resource.',
  },
  default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred. Please try again or contact support.',
  },
};

interface Props {
  searchParams: Promise<{ message?: string }>;
}

export default async function AuthErrorPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorKey = params.message || 'default';
  const error = ERROR_MESSAGES[errorKey] || ERROR_MESSAGES.default;

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">{error.title}</h1>
          <p className="text-zinc-400 leading-relaxed">{error.description}</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Login
          </Link>

          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-4 rounded-sm transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </Link>
        </div>

        <p className="mt-8 text-xs text-zinc-600">
          Error code: {errorKey}
        </p>
      </div>
    </main>
  );
}
