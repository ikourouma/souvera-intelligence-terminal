import { NextResponse, type NextRequest } from 'next/server';
// Assuming @supabase/ssr or similar is used, but for now we do a simple cookie check
// since we haven't set up the full SSRA Supabase package in this file.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const referer = request.headers.get('referer') || '';

  // 1. Handle Terminal and Regional Routes
  const isTerminalPath = pathname.startsWith('/terminal') || 
                         pathname.startsWith('/africa') || 
                         pathname.startsWith('/caribbean') || 
                         pathname.startsWith('/dashboard');

  if (isTerminalPath) {
    // Redirect root /terminal to /terminal/africa
    if (pathname === '/terminal' || pathname === '/terminal/') {
      return NextResponse.redirect(new URL('/terminal/africa', request.url));
    }

    const url = request.nextUrl.clone();
    url.hostname = 'localhost';
    url.port = '3000';
    
    // Rewrite /terminal/xxx -> /xxx, but keep /africa as /africa
    url.pathname = pathname.replace(/^\/terminal/, '') || '/';
    
    return NextResponse.rewrite(url);
  }

  // 2. Handle Static Assets for Terminal/Regional pages
  const isAssetForTerminal = pathname.startsWith('/_next') && (
    referer.includes('/terminal') || 
    referer.includes('/africa') || 
    referer.includes('/caribbean') || 
    referer.includes('/dashboard')
  );

  if (isAssetForTerminal) {
    const url = request.nextUrl.clone();
    url.hostname = 'localhost';
    url.port = '3000';
    return NextResponse.rewrite(url);
  }

  // 3. Default: Next.js handles it locally (Landing Page, etc.)
  const response = NextResponse.next();
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'no-referrer');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
