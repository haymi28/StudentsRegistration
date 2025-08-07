import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // These are public paths that don't require authentication
  const publicPaths = ['/login'];

  // Check if the path is for static files, API routes, or images, which should be ignored.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.includes('/favicon.ico') ||
    pathname.startsWith('/i18n')
  ) {
    return NextResponse.next();
  }
  
  // For this simple auth system, we can't check the cookie on the server easily.
  // The check is performed in the AuthProvider on the client side.
  // This middleware is now primarily for structural purposes or future server-side checks.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - i18n (translation files)
     * We exclude /api/auth routes as they are handled by NextAuth
     */
    '/((?!_next/static|_next/image|favicon.ico|i18n).*)',
  ],
};
