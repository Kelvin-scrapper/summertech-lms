import Link from 'next/link';
import { Clock, PlayCircle, ArrowRight, BookOpen } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCourseTree, courseProgress, nextLesson } from '@/lib/progress';
import ProgressBar from '@/components/ProgressBar';

const areaGradient: Record<string, string> = {
  'Web Development': 'from-emerald-600 to-emerald-800',
  Design: 'from-pink-600 to-pink-800',
  Foundations: 'from-blue-600 to-blue-800',
  AI: 'from-purple-600 to-purple-800',
};

export default async function DashboardPage() {
  const user = await requireUser();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, status: { not: 'DROPPED' } },
    orderBy: { enrolledAt: 'asc' },
    include: { course: true },
  });

  const cards = await Promise.all(
    enrollments.map(async (e) => {
      const tree = await getCourseTree(e.course.slug);
      if (!tree) return null;
      const prog = await courseProgress(user.id, tree);
      const nxt = nextLesson(tree, prog.completed);
      return { course: e.course, prog, nxt };
    }),
  );
  const learning = cards.filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-bold">Welcome back, {user.name?.split(' ')[0] ?? 'there'}!</h1>
      <p className="mt-1 text-slate-500">Pick up where you left off and keep up the momentum.</p>

      <h2 className="mt-10 mb-4 font-display text-lg font-bold">My Learning Path</h2>

      {learning.length === 0 ? (
        <div className="card p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-medium">You&apos;re not enrolled in any courses yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Browse the catalogue, or ask an admin to enrol you.
          </p>
          <Link href="/courses" className="btn-primary mt-4">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {learning.map(({ course, prog, nxt }) => (
            <div key={course.id} className="card flex flex-col overflow-hidden sm:flex-row">
              <div
                className={`flex shrink-0 items-end bg-gradient-to-br p-5 text-white sm:w-56 ${
                  areaGradient[course.area] ?? 'from-slate-600 to-slate-800'
                }`}
              >
                <div>
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                    {course.area}
                  </span>
                  <BookOpen className="mt-6 h-7 w-7 opacity-80" />
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-xl font-bold">{course.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{course.description}</p>

                <div className="mt-4 flex items-center gap-5 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {course.durationText}
                  </span>
                  <span className="flex items-center gap-1.5 text-brand-700">
                    <PlayCircle className="h-4 w-4" /> {prog.percent}% Completed
                  </span>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <p className="mb-1.5 text-xs font-medium text-slate-600">
                      {nxt ? `${nxt.module.title} · ${nxt.lesson.title}` : 'All lessons complete 🎉'}
                    </p>
                    <ProgressBar percent={prog.percent} />
                  </div>
                  <Link
                    href={
                      nxt
                        ? `/learn/${course.slug}/${nxt.lesson.id}`
                        : `/courses/${course.slug}`
                    }
                    className="btn-primary shrink-0"
                  >
                    {nxt ? 'Continue Learning' : 'Review course'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
