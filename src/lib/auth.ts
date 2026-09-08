import { redirect } from 'next/navigation';
import type { Role, User } from '@prisma/client';
import { prisma } from './prisma';
import { readSession } from './session';

/** The signed-in user, or null. Suspended users resolve to null. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await readSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user || !user.active) return null;
  return user;
}

/** Require a signed-in user; redirect to /login otherwise. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

/** Require one of the given roles; redirect otherwise. */
export async function requireRole(roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect('/dashboard');
  return user;
}

export function canTeach(role: Role): boolean {
  return role === 'INSTRUCTOR' || role === 'ADMIN';
}

/** True if the user teaches this course (or is an admin). */
export async function teachesCourse(userId: string, courseId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  const link = await prisma.course.findFirst({
    where: { id: courseId, instructors: { some: { id: userId } } },
    select: { id: true },
  });
  return Boolean(link);
}
