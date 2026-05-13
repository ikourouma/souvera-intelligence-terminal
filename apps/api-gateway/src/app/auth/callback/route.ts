import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/intelligence/map';
  const invitationToken = searchParams.get('invitation');

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Determine redirect based on invitation status
      let redirectPath = next;
      
      // If this is a new user from an invitation, redirect to set password page
      if (invitationToken) {
        // Check if user needs to set password (new invited user)
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !user.user_metadata?.password_set) {
          redirectPath = '/auth/set-password';
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }

  // Check if invitation token is expired
  if (invitationToken) {
    return NextResponse.redirect(`${origin}/auth/error?message=invitation_expired`);
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error?message=auth_callback_error`);
}
