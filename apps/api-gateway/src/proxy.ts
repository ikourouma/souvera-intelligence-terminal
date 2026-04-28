import { NextResponse, type NextRequest } from 'next/server';
// Assuming @supabase/ssr or similar is used, but for now we do a simple cookie check
// since we haven't set up the full SSRA Supabase package in this file.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const referer = request.headers.get('referer') || '';

  // 1. Handle Terminal and Regional Routes
  // We only proxy if it's explicitly a terminal path or a direct regional functional path
  const isTerminalPath = pathname.startsWith('/terminal') || 
                         pathname === '/africa/map' || 
                         pathname === '/caribbean/map' ||
                         pathname.startsWith('/data/') ||
                         pathname.startsWith('/dashboard');

  if (isTerminalPath) {
    // Redirect root /terminal to /terminal/africa
    if (pathname === '/terminal' || pathname === '/terminal/') {
      return NextResponse.redirect(new URL('/terminal/africa', request.url));
    }

    // Determine target URL (Vercel-friendly)
    const terminalUrl = process.env.TERMINAL_URL || 'http://localhost:3000';
    
    // Normalize path for the terminal app
    let terminalPath = pathname;
    if (pathname.startsWith('/terminal')) {
      terminalPath = pathname.replace(/^\/terminal/, '') || '/';
    }
    
    const targetUrl = new URL(terminalPath, terminalUrl);
    return NextResponse.rewrite(targetUrl);
  }

  // 2. Handle Static Assets for Terminal/Regional pages
  const isAssetForTerminal = pathname.startsWith('/_next') && (
    referer.includes('/terminal') || 
    referer.includes('/africa/map') || 
    referer.includes('/caribbean/map') || 
    referer.includes('/dashboard')
  );

  if (isAssetForTerminal) {
    const terminalUrl = process.env.TERMINAL_URL || 'http://localhost:3000';
    const targetUrl = new URL(pathname, terminalUrl);
    return NextResponse.rewrite(targetUrl);
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
