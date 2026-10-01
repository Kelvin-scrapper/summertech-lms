import { cookies } from 'next/headers';

// Holds the API access token. httpOnly, so browser scripts can't read it; the
// Next server attaches it to API requests.
export const SESSION_COOKIE = 'st_session';

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function setSession(token: string, expiresAt: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
