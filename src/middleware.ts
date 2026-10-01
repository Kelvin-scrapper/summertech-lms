import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

// Sends visitors without a session to sign-in before any page work happens.
// The API is the authority: pages re-check the user and role on every load.
export function middleware(req: NextRequest) {
  if (req.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/dashboard/:path*', '/courses/:path*', '/learn/:path*', '/settings/:path*', '/help/:path*', '/teach/:path*', '/admin/:path*'],
};
