import { cache } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Clock, PlayCircle, Paperclip } from 'lucide-react';
import { load } from '@/lib/api';
import type { CourseDetail } from '@/lib/types';
import ProgressBar from '@/components/ProgressBar';
import EnrollButton from '@/components/EnrollButton';

// Shared by the metadata and the page, so the API is called once per request.
const getCourse = cache((slug: string) => load<CourseDetail>(`/courses/${encodeURIComponent(slug)}`));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: (await getCourse(slug)).course.title };
}

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { course, enrollment, canEdit, progress: prog, next: nxt } = await getCourse(slug);
  const completed = new Set(prog.completedLessonIds);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{course.area}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{course.tier}</span>
      </div>
      <h1 className="mt-3 font-display text-3xl font-bold">{course.title}</h1>
      <p className="mt-2 text-slate-600">{course.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {course.durationText}
        </span>
        <span>{prog.total} lessons</span>
        {course.instructors.length > 0 ? (
          <span>Tutor: {course.instructors.map((i) => i.name ?? i.email).join(', ')}</span>
        ) : null}
      </div>

      <div className="card mt-6 p-5">
        {enrollment ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-brand-700">{prog.percent}% complete</span>
              <span className="text-slate-500">
                {prog.done} / {prog.total}
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar percent={prog.percent} />
            </div>
            <Link
              href={nxt ? `/learn/${course.slug}/${nxt.lessonId}` : '#'}
              className="btn-primary mt-4"
            >
              <PlayCircle className="h-4 w-4" />
              {nxt ? (prog.done === 0 ? 'Start course' : 'Continue') : 'Course complete'}
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600">You&apos;re not enrolled in this course yet.</p>
            <div className="mt-3">
              <EnrollButton courseId={course.id} />
            </div>
          </>
        )}
      </div>

      <h2 className="mt-10 mb-3 font-display text-lg font-bold">Curriculum</h2>
      <div className="space-y-5">
        {course.modules.map((m, mi) => (
          <div key={m.id} className="card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
              <h3 className="font-semibold">
                {mi + 1}. {m.title}
              </h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {m.lessons.map((l) => {
                const done = completed.has(l.id);
                const inner = (
                  <div className="flex items-center gap-3 px-5 py-3">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-700" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                    )}
                    <span className={`flex-1 text-sm ${done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {l.title}
                    </span>
                    {l.resourceCount > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Paperclip className="h-3.5 w-3.5" />
                        {l.resourceCount}
                      </span>
                    ) : null}
                    <span className="text-xs text-slate-400">{l.estMinutes}m</span>
                  </div>
                );
                return (
                  <li key={l.id}>
                    {enrollment || canEdit ? (
                      <Link href={`/learn/${course.slug}/${l.id}`} className="block hover:bg-slate-50">
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
              {m.lessons.length === 0 ? (
                <li className="px-5 py-3 text-sm text-slate-400">No lessons yet.</li>
              ) : null}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
