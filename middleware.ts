import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await getServerSession({ req: request, ...authOptions });
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/';

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/students', request.url));
  }

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - i18n (translation files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|i18n).*)',
  ],
};
