import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { setSession } from '@/lib/session';
import type { Session } from '@/lib/types';

// Magic-link landing: the API checks the token, we store the session cookie.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  const email = url.searchParams.get('email') ?? '';
  const next = url.searchParams.get('next') || '/dashboard';

  try {
    const session = await api<Session>('/auth/magic-link/verify', { method: 'POST', token: null, body: { email, token } });
    await setSession(session.token, session.expiresAt);
  } catch {
    return NextResponse.redirect(new URL('/login?error=link', request.url));
  }

  const dest = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
  return NextResponse.redirect(new URL(dest, request.url));
}
