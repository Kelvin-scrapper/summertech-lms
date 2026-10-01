'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { api, ApiError } from './api';
import { clearSession, setSession } from './session';
import type { FormState } from './form';
import type { ResourceKind, Role, Session } from './types';

const text = (formData: FormData, key: string) => String(formData.get(key) ?? '');

// Form actions: show the API's message next to the form instead of failing.
// A 401 means the session lapsed — except on the sign-in forms themselves,
// where it means wrong credentials.
async function attempt(fn: () => Promise<unknown>, { signInForm = false } = {}): Promise<FormState | null> {
  try {
    await fn();
    return null;
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401 && !signInForm) redirect('/login');
      return { error: err.message };
    }
    throw err;
  }
}

// Button/inline actions: a lapsed session goes to sign-in; other failures
// surface through the error boundary.
async function call(path: string, method: string, body?: unknown): Promise<void> {
  try {
    await api(path, { method, body });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login');
    throw err;
  }
}

/* ---------------------------------------------------------------- auth ---- */

export async function signInWithPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const next = text(formData, 'next');
  const failed = await attempt(async () => {
    const session = await api<Session>('/auth/login', {
      method: 'POST',
      token: null,
      body: { email: text(formData, 'email'), password: text(formData, 'password') },
    });
    await setSession(session.token, session.expiresAt);
  }, { signInForm: true });
  if (failed) return failed;
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');
}

export async function requestMagicLink(_prev: FormState, formData: FormData): Promise<FormState> {
  let message = '';
  const failed = await attempt(async () => {
    ({ message } = await api<{ message: string }>('/auth/magic-link', {
      method: 'POST',
      token: null,
      body: { email: text(formData, 'email').trim() },
    }));
  }, { signInForm: true });
  return failed ?? { ok: true, message };
}

export async function signOut(): Promise<void> {
  // Revoke server-side too, so a copied token stops working.
  await api('/auth/logout', { method: 'POST' }).catch(() => {});
  await clearSession();
  redirect('/login');
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const failed = await attempt(() =>
    api('/auth/me/password', { method: 'PUT', body: { current: text(formData, 'current'), next: text(formData, 'next') } }),
  );
  if (failed) return failed;
  revalidatePath('/settings');
  return { ok: true, message: 'Password updated.' };
}

export async function updateName(_prev: FormState, formData: FormData): Promise<FormState> {
  const failed = await attempt(() => api('/auth/me', { method: 'PATCH', body: { name: text(formData, 'name') } }));
  if (failed) return failed;
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Saved.' };
}

/* ------------------------------------------------------------ learning ---- */

export async function enroll(courseId: string): Promise<void> {
  const { slug } = await api<{ slug: string }>(`/courses/${courseId}/enroll`, { method: 'POST' }).catch((err) => {
    if (err instanceof ApiError && err.status === 401) redirect('/login');
    throw err;
  });
  revalidatePath('/', 'layout');
  redirect(`/courses/${slug}`);
}

export async function setLessonComplete(lessonId: string, done: boolean): Promise<void> {
  await call(`/learning/lessons/${lessonId}/complete`, done ? 'PUT' : 'DELETE');
  revalidatePath('/', 'layout');
}

/* ------------------------------------------------ teaching (tutors) ---- */

// Every editor change re-renders the teach pages and the learner views.
async function edit(path: string, method: string, body?: unknown) {
  await call(path, method, body);
  revalidatePath('/', 'layout');
}

export async function createModule(courseId: string, formData: FormData): Promise<void> {
  await edit(`/teach/courses/${courseId}/modules`, 'POST', { title: text(formData, 'title') });
}

export async function renameModule(moduleId: string, formData: FormData): Promise<void> {
  await edit(`/teach/modules/${moduleId}`, 'PATCH', { title: text(formData, 'title') });
}

export async function deleteModule(moduleId: string): Promise<void> {
  await edit(`/teach/modules/${moduleId}`, 'DELETE');
}

export async function moveModule(moduleId: string, direction: 'up' | 'down'): Promise<void> {
  await edit(`/teach/modules/${moduleId}/move`, 'POST', { direction });
}

export async function createLesson(moduleId: string, formData: FormData): Promise<void> {
  await edit(`/teach/modules/${moduleId}/lessons`, 'POST', { title: text(formData, 'title') });
}

export async function updateLesson(lessonId: string, formData: FormData): Promise<void> {
  await edit(`/teach/lessons/${lessonId}`, 'PATCH', {
    title: text(formData, 'title'),
    contentMarkdown: text(formData, 'contentMarkdown'),
    estMinutes: Number(formData.get('estMinutes')) || 10,
  });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await edit(`/teach/lessons/${lessonId}`, 'DELETE');
}

export async function moveLesson(lessonId: string, direction: 'up' | 'down'): Promise<void> {
  await edit(`/teach/lessons/${lessonId}/move`, 'POST', { direction });
}

export async function addResourceLink(lessonId: string, formData: FormData): Promise<void> {
  await edit(`/teach/lessons/${lessonId}/resources`, 'POST', {
    title: text(formData, 'title'),
    url: text(formData, 'url'),
    kind: (text(formData, 'kind') || 'LINK') as ResourceKind,
  });
}

export async function deleteResource(resourceId: string): Promise<void> {
  await edit(`/teach/resources/${resourceId}`, 'DELETE');
}

/* --------------------------------------------------------------- admin ---- */

export async function adminCreateUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, 'email').trim().toLowerCase();
  const password = text(formData, 'password');
  const failed = await attempt(() =>
    api('/users', {
      method: 'POST',
      body: { email, name: text(formData, 'name'), role: text(formData, 'role') || 'STUDENT', password },
    }),
  );
  if (failed) return failed;
  revalidatePath('/admin', 'layout');
  return {
    ok: true,
    message: password
      ? `Created ${email}. Share the password with them securely.`
      : `Created ${email}. They can sign in with a magic link, or set a password.`,
  };
}

export async function adminSetActive(userId: string, active: boolean): Promise<void> {
  await edit(`/users/${userId}`, 'PATCH', { active });
}

export async function adminSetRole(userId: string, role: Role): Promise<void> {
  await edit(`/users/${userId}`, 'PATCH', { role });
}

export async function adminEnroll(formData: FormData): Promise<void> {
  await edit('/enrollments', 'POST', { userId: text(formData, 'userId'), courseId: text(formData, 'courseId') });
}

export async function adminAssignInstructor(formData: FormData): Promise<void> {
  await edit(`/courses/${text(formData, 'courseId')}/instructors`, 'POST', { userId: text(formData, 'userId') });
}

export async function adminUnassignInstructor(courseId: string, userId: string): Promise<void> {
  await edit(`/courses/${courseId}/instructors/${userId}`, 'DELETE');
}
