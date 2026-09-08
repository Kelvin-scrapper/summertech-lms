import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminEnroll } from '@/lib/actions';

export const metadata: Metadata = { title: 'Admin · Enrolments' };

export default async function AdminEnrollmentsPage() {
  await requireRole(['ADMIN']);

  const [users, courses, enrollments] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: 'asc' } }),
    prisma.course.findMany({ orderBy: { order: 'asc' } }),
    prisma.enrollment.findMany({
      orderBy: { enrolledAt: 'desc' },
      include: { user: true, course: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Enrolments</h1>
      <p className="mt-1 text-slate-500">Put a learner into a course. It appears on their dashboard immediately.</p>

      <form action={adminEnroll} className="card mt-6 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="label">Learner</label>
          <select name="userId" required className="input" defaultValue="">
            <option value="" disabled>
              Choose a person
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ?? u.email} ({u.role.toLowerCase()})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Course</label>
          <select name="courseId" required className="input" defaultValue="">
            <option value="" disabled>
              Choose a course
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Enrol
        </button>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400">
              <th className="px-5 py-3 font-medium">Learner</th>
              <th className="px-5 py-3 font-medium">Course</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Since</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium">{e.user.name ?? e.user.email}</td>
                <td className="px-5 py-3 text-slate-600">{e.course.title}</td>
                <td className="px-5 py-3 text-slate-500">{e.status.toLowerCase()}</td>
                <td className="px-5 py-3 text-slate-500">
                  {e.enrolledAt.toLocaleDateString('en-KE')}
                </td>
              </tr>
            ))}
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                  No enrolments yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
