import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/access',
  '/contact',
  '/status',
  '/login',
  '/register',
  '/signup',
  '/auth',
  '/legal',
  '/platform',
  '/intelligence',
  '/sectors',
  '/insights',
  '/resources',
  '/sitemap',
  '/api',
];

const PROTECTED_ROUTES = [
  '/terminal',
  '/profile',
  '/settings',
  '/org',
  '/admin',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const referer = request.headers.get('referer') || '';

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    // Handle Static Assets for Terminal/Regional pages (legacy proxy logic)
    const isAssetForTerminal = pathname.startsWith('/_next') && (
      referer.includes('/terminal') || 
      referer.includes('/africa/map') || 
      referer.includes('/caribbean/map')
    );

    if (isAssetForTerminal && process.env.TERMINAL_URL) {
      const terminalUrl = process.env.TERMINAL_URL;
      const targetUrl = new URL(pathname, terminalUrl);
      return NextResponse.rewrite(targetUrl);
    }

    return NextResponse.next();
  }

  // Update session and get user
  const { supabaseResponse, user } = await updateSession(request);

  // Redirect authenticated users away from login/register/signup
  if (user && (pathname === '/login' || pathname === '/register' || pathname.startsWith('/signup'))) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/intelligence';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Protect routes that require authentication
  if (isProtectedRoute(pathname) && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle Terminal and Regional Routes (legacy proxy logic for terminal app)
  const isTerminalPath = pathname.startsWith('/terminal') || 
                         pathname === '/africa/map' || 
                         pathname === '/caribbean/map' ||
                         pathname.startsWith('/data/');

  if (isTerminalPath && process.env.TERMINAL_URL) {
    // Redirect root /terminal to /terminal/africa
    if (pathname === '/terminal' || pathname === '/terminal/') {
      return NextResponse.redirect(new URL('/terminal/africa', request.url));
    }

    const terminalUrl = process.env.TERMINAL_URL;
    
    // Normalize path for the terminal app
    let terminalPath = pathname;
    if (pathname.startsWith('/terminal')) {
      terminalPath = pathname.replace(/^\/terminal/, '') || '/';
    }
    
    const targetUrl = new URL(terminalPath, terminalUrl);
    return NextResponse.rewrite(targetUrl);
  }

  // Add security headers
  supabaseResponse.headers.set('x-frame-options', 'DENY');
  supabaseResponse.headers.set('x-content-type-options', 'nosniff');
  supabaseResponse.headers.set('referrer-policy', 'strict-origin-when-cross-origin');

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
