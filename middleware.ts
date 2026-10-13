import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/docs',
  '/privacy',
  '/terms',
  '/datadeletion',
  '/data-deletion',
  '/deletion',
  '/sign-in',
  '/sign-up',
  '/api/inngest',
  '/api/auth/hellostores',
  '/api/auth/redefine',
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public routes and Next.js internals
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for Firebase session cookie
  const session = req.cookies.get('__session')?.value;

  // If no session and trying to access a protected route, redirect to sign-in
  if (!session && !pathname.startsWith('/api/')) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
