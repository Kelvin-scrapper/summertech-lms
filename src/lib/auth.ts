import { cache } from 'react';
import { redirect } from 'next/navigation';
import { api, ApiError } from './api';
import { getToken } from './session';
import type { Role, User } from './types';

/** The signed-in user, or null. Fetched once per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!(await getToken())) return null;
  try {
    return await api<User>('/auth/me');
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect('/dashboard');
  return user;
}
