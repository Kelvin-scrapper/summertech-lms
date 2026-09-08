'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { Role, ResourceKind } from '@prisma/client';
import { prisma } from './prisma';
import { requireUser, requireRole, teachesCourse } from './auth';
import { createSession, destroySession } from './session';
import { issueMagicLink } from './magic-link';
import { hashPassword, verifyPassword, passwordProblem } from './password';
import type { FormState } from './form';

/* ---------------------------------------------------------------- auth ---- */

export async function signInWithPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/dashboard');

  const fail: FormState = { error: 'Wrong email or password, or your account is not active yet.' };
  if (!z.string().email().safeParse(email).success || !password) return fail;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return fail;
  if (!(await verifyPassword(password, user.passwordHash))) return fail;

  await createSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  redirect(next.startsWith('/') ? next : '/dashboard');
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(formData.get('current') ?? '');
  const next = String(formData.get('next') ?? '');

  if (user.passwordHash && !(await verifyPassword(current, user.passwordHash))) {
    return { error: 'Current password is incorrect.' };
  }
  const problem = passwordProblem(next);
  if (problem) return { error: problem };

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: true, message: 'Password updated.' };
}

export async function requestMagicLink(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = z.string().email().safeParse(String(formData.get('email') ?? '').trim());
  if (!email.success) return { error: 'Enter a valid email address.' };
  try {
    await issueMagicLink(email.data);
  } catch (e) {
    console.error('[magic-link]', e);
    return { error: 'Could not send the link. Try again shortly.' };
  }
  return { ok: true, message: 'If that email has an account, a sign-in link is on its way.' };
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect('/login');
}

/* ------------------------------------------------------------ learning ---- */

export async function enroll(courseId: string): Promise<void> {
  const user = await requireUser();
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: { status: 'ACTIVE' },
    create: { userId: user.id, courseId },
  });
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { slug: true } });
  revalidatePath('/dashboard');
  if (course) redirect(`/courses/${course.slug}`);
}

export async function setLessonComplete(lessonId: string, done: boolean): Promise<void> {
  const user = await requireUser();
  if (done) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: {},
      create: { userId: user.id, lessonId },
    });
  } else {
    await prisma.lessonProgress
      .delete({ where: { userId_lessonId: { userId: user.id, lessonId } } })
      .catch(() => {});
  }
  revalidatePath('/dashboard');
  revalidatePath('/courses', 'layout');
  revalidatePath('/learn', 'layout');
}

export async function updateName(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = String(formData.get('name') ?? '').trim().slice(0, 120);
  if (name.length < 2) return { error: 'Name is too short.' };
  await prisma.user.update({ where: { id: user.id }, data: { name } });
  revalidatePath('/settings');
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Saved.' };
}

/* ------------------------------------------------ teaching (tutors) ---- */

async function assertCanEdit(courseId: string) {
  const user = await requireRole(['INSTRUCTOR', 'ADMIN']);
  if (!(await teachesCourse(user.id, courseId))) redirect('/teach');
  return user;
}

async function courseSlug(courseId: string) {
  const c = await prisma.course.findUnique({ where: { id: courseId }, select: { slug: true } });
  return c?.slug;
}

export async function createModule(courseId: string, formData: FormData): Promise<void> {
  await assertCanEdit(courseId);
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  const count = await prisma.module.count({ where: { courseId } });
  await prisma.module.create({ data: { courseId, title, order: count } });
  revalidatePath(`/teach/${await courseSlug(courseId)}`);
}

export async function renameModule(moduleId: string, formData: FormData): Promise<void> {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) return;
  await assertCanEdit(mod.courseId);
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  await prisma.module.update({ where: { id: moduleId }, data: { title } });
  revalidatePath(`/teach/${await courseSlug(mod.courseId)}`);
}

export async function deleteModule(moduleId: string): Promise<void> {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) return;
  await assertCanEdit(mod.courseId);
  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath(`/teach/${await courseSlug(mod.courseId)}`);
}

export async function moveModule(moduleId: string, dir: 'up' | 'down'): Promise<void> {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) return;
  await assertCanEdit(mod.courseId);
  const sibling = await prisma.module.findFirst({
    where: {
      courseId: mod.courseId,
      order: dir === 'up' ? { lt: mod.order } : { gt: mod.order },
    },
    orderBy: { order: dir === 'up' ? 'desc' : 'asc' },
  });
  if (!sibling) return;
  await prisma.$transaction([
    prisma.module.update({ where: { id: mod.id }, data: { order: sibling.order } }),
    prisma.module.update({ where: { id: sibling.id }, data: { order: mod.order } }),
  ]);
  revalidatePath(`/teach/${await courseSlug(mod.courseId)}`);
}

export async function createLesson(moduleId: string, formData: FormData): Promise<void> {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) return;
  await assertCanEdit(mod.courseId);
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  const count = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({
    data: { moduleId, title, order: count, contentMarkdown: '', estMinutes: 10 },
  });
  revalidatePath(`/teach/${await courseSlug(mod.courseId)}`);
}

export async function updateLesson(lessonId: string, formData: FormData): Promise<void> {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: true } });
  if (!lesson) return;
  await assertCanEdit(lesson.module.courseId);
  const title = String(formData.get('title') ?? '').trim();
  const contentMarkdown = String(formData.get('contentMarkdown') ?? '');
  const estMinutes = Math.max(1, Math.min(600, Number(formData.get('estMinutes') ?? 10) || 10));
  if (!title) return;
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { title, contentMarkdown, estMinutes },
  });
  revalidatePath(`/teach/${await courseSlug(lesson.module.courseId)}`);
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: true } });
  if (!lesson) return;
  await assertCanEdit(lesson.module.courseId);
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/teach/${await courseSlug(lesson.module.courseId)}`);
}

export async function moveLesson(lessonId: string, dir: 'up' | 'down'): Promise<void> {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: true } });
  if (!lesson) return;
  await assertCanEdit(lesson.module.courseId);
  const sibling = await prisma.lesson.findFirst({
    where: {
      moduleId: lesson.moduleId,
      order: dir === 'up' ? { lt: lesson.order } : { gt: lesson.order },
    },
    orderBy: { order: dir === 'up' ? 'desc' : 'asc' },
  });
  if (!sibling) return;
  await prisma.$transaction([
    prisma.lesson.update({ where: { id: lesson.id }, data: { order: sibling.order } }),
    prisma.lesson.update({ where: { id: sibling.id }, data: { order: lesson.order } }),
  ]);
  revalidatePath(`/teach/${await courseSlug(lesson.module.courseId)}`);
}

/* ---------------------------------------------- lesson resources ---- */

export async function addResourceLink(lessonId: string, formData: FormData): Promise<void> {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: true } });
  if (!lesson) return;
  await assertCanEdit(lesson.module.courseId);

  const title = String(formData.get('title') ?? '').trim();
  const url = String(formData.get('url') ?? '').trim();
  const kind = String(formData.get('kind') ?? 'LINK') as ResourceKind;
  if (!title || !/^https?:\/\//i.test(url)) return;

  const count = await prisma.resource.count({ where: { lessonId } });
  await prisma.resource.create({ data: { lessonId, title, url, kind, order: count } });
  revalidatePath(`/teach/${await courseSlug(lesson.module.courseId)}`);
}

export async function deleteResource(resourceId: string): Promise<void> {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: { lesson: { include: { module: true } } },
  });
  if (!resource) return;
  await assertCanEdit(resource.lesson.module.courseId);
  await prisma.resource.delete({ where: { id: resourceId } });
  revalidatePath(`/teach/${await courseSlug(resource.lesson.module.courseId)}`);
}

/* --------------------------------------------------------------- admin ---- */

export async function adminCreateUser(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole(['ADMIN']);
  const parsed = z
    .object({
      email: z.string().email(),
      name: z.string().trim().min(2).max(120),
      role: z.enum(['STUDENT', 'MENTOR', 'INSTRUCTOR', 'ADMIN']),
    })
    .safeParse({
      email: String(formData.get('email') ?? '').trim().toLowerCase(),
      name: String(formData.get('name') ?? '').trim(),
      role: String(formData.get('role') ?? 'STUDENT'),
    });
  if (!parsed.success) return { error: 'Check the fields and try again.' };

  const password = String(formData.get('password') ?? '');
  if (password) {
    const problem = passwordProblem(password);
    if (problem) return { error: problem };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: 'A user with that email already exists.' };

  await prisma.user.create({
    data: {
      ...parsed.data,
      passwordHash: password ? await hashPassword(password) : null,
    } as { email: string; name: string; role: Role; passwordHash: string | null },
  });
  revalidatePath('/admin/users');
  return {
    ok: true,
    message: password
      ? `Created ${parsed.data.email}. Share the password with them securely.`
      : `Created ${parsed.data.email}. They can sign in with a magic link, or set a password.`,
  };
}

export async function adminSetActive(userId: string, active: boolean): Promise<void> {
  const me = await requireRole(['ADMIN']);
  if (me.id === userId) return; // an admin can't suspend themselves
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath('/admin/users');
}

export async function adminSetRole(userId: string, role: Role): Promise<void> {
  const me = await requireRole(['ADMIN']);
  if (me.id === userId) return; // don't let an admin demote themselves by accident
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath('/admin/users');
}

export async function adminEnroll(formData: FormData): Promise<void> {
  await requireRole(['ADMIN']);
  const userId = String(formData.get('userId') ?? '');
  const courseId = String(formData.get('courseId') ?? '');
  if (!userId || !courseId) return;
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { status: 'ACTIVE' },
    create: { userId, courseId },
  });
  revalidatePath('/admin/enrollments');
}

export async function adminAssignInstructor(formData: FormData): Promise<void> {
  await requireRole(['ADMIN']);
  const userId = String(formData.get('userId') ?? '');
  const courseId = String(formData.get('courseId') ?? '');
  if (!userId || !courseId) return;
  await prisma.course.update({
    where: { id: courseId },
    data: { instructors: { connect: { id: userId } } },
  });
  revalidatePath('/admin/courses');
}

export async function adminUnassignInstructor(courseId: string, userId: string): Promise<void> {
  await requireRole(['ADMIN']);
  await prisma.course.update({
    where: { id: courseId },
    data: { instructors: { disconnect: { id: userId } } },
  });
  revalidatePath('/admin/courses');
}
