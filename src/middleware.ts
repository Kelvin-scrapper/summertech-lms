import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken, SESSION_COOKIE } from '@/lib/session';

const PROTECTED = ['/dashboard', '/courses', '/learn', '/settings', '/help', '/teach', '/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin') && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  if (pathname.startsWith('/teach') && session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/courses/:path*', '/learn/:path*', '/settings/:path*', '/help/:path*', '/teach/:path*', '/admin/:path*'],
};
