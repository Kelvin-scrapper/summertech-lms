import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consumeMagicLink } from '@/lib/magic-link';
import { createSession } from '@/lib/session';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  const email = url.searchParams.get('email') ?? '';
  const next = url.searchParams.get('next') || '/dashboard';

  const userId = token && email ? await consumeMagicLink(email, token) : null;
  if (!userId) {
    return NextResponse.redirect(new URL('/login?error=link', request.url));
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=link', request.url));
  }

  await createSession({ sub: user.id, email: user.email, name: user.name, role: user.role });

  const dest = next.startsWith('/') ? next : '/dashboard';
  return NextResponse.redirect(new URL(dest, request.url));
}
