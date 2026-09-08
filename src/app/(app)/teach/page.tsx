import Link from 'next/link';
import type { Metadata } from 'next';
import { SquarePen, BookOpen } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Teaching' };

export default async function TeachPage() {
  const user = await requireRole(['INSTRUCTOR', 'ADMIN']);

  const courses = await prisma.course.findMany({
    where: user.role === 'ADMIN' ? {} : { instructors: { some: { id: user.id } } },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { modules: true, enrollments: true } },
      modules: { select: { _count: { select: { lessons: true } } } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Teaching</h1>
      <p className="mt-1 text-slate-500">
        {user.role === 'ADMIN'
          ? 'All courses. Edit modules, lessons and resources.'
          : 'Courses you tutor. Edit their modules, lessons and resources.'}
      </p>

      {courses.length === 0 ? (
        <div className="card mt-8 p-8 text-center text-slate-500">
          You&apos;re not assigned to any courses yet. An admin can assign you in Admin → Courses.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {courses.map((c) => {
            const lessons = c.modules.reduce((n, m) => n + m._count.lessons, 0);
            return (
              <Link
                key={c.id}
                href={`/teach/${c.slug}`}
                className="card flex items-center gap-4 p-5 transition-colors hover:border-slate-300"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent-600">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-bold">{c.title}</h2>
                  <p className="text-sm text-slate-500">
                    {c._count.modules} modules · {lessons} lessons · {c._count.enrollments} enrolled
                  </p>
                </div>
                <SquarePen className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
