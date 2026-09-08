import type { Metadata } from 'next';
import { X } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminAssignInstructor, adminUnassignInstructor } from '@/lib/actions';

export const metadata: Metadata = { title: 'Admin · Courses' };

export default async function AdminCoursesPage() {
  await requireRole(['ADMIN']);

  const [courses, staff] = await Promise.all([
    prisma.course.findMany({
      orderBy: { order: 'asc' },
      include: {
        instructors: { select: { id: true, name: true, email: true } },
        _count: { select: { modules: true, enrollments: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ['INSTRUCTOR', 'ADMIN'] } },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Courses</h1>
      <p className="mt-1 text-slate-500">Assign tutors. A tutor can edit the modules, lessons and resources of their courses.</p>

      <div className="mt-6 space-y-4">
        {courses.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold">{c.title}</h2>
                <p className="text-sm text-slate-500">
                  {c._count.modules} modules · {c._count.enrollments} enrolled
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {c.instructors.map((i) => (
                <span
                  key={i.id}
                  className="flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-sm text-brand-800"
                >
                  {i.name ?? i.email}
                  <form action={adminUnassignInstructor.bind(null, c.id, i.id)}>
                    <button className="grid h-5 w-5 place-items-center rounded-full hover:bg-brand-100" aria-label="Remove tutor">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </span>
              ))}
              {c.instructors.length === 0 ? (
                <span className="text-sm text-slate-400">No tutor assigned</span>
              ) : null}
            </div>

            <form action={adminAssignInstructor} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="courseId" value={c.id} />
              <select name="userId" required className="input max-w-xs py-1.5 text-sm" defaultValue="">
                <option value="" disabled>
                  Add a tutor…
                </option>
                {staff
                  .filter((s) => !c.instructors.some((i) => i.id === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name ?? s.email}
                    </option>
                  ))}
              </select>
              <button type="submit" className="btn-secondary">
                Assign
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
