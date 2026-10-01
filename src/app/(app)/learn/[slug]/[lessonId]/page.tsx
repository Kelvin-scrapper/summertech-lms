import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { load } from '@/lib/api';
import { flattenLessons } from '@/lib/progress';
import type { CourseDetail } from '@/lib/types';
import Markdown from '@/components/Markdown';
import MarkCompleteButton from '@/components/MarkCompleteButton';
import ResourceView from '@/components/ResourceView';
import ProgressBar from '@/components/ProgressBar';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;

  const { course, enrollment, canEdit, progress: prog } = await load<CourseDetail>(`/courses/${encodeURIComponent(slug)}`);
  if (!enrollment && !canEdit) redirect(`/courses/${slug}`);

  const flat = flattenLessons(course);
  const index = flat.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();

  const lesson = flat[index];
  const prev = flat[index - 1];
  const next = flat[index + 1];

  const completed = new Set(prog.completedLessonIds);
  const done = completed.has(lesson.id);
  const resources = lesson.resources ?? [];

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[260px_1fr]">
      {/* lesson tree */}
      <aside className="hidden lg:block">
        <Link href={`/courses/${slug}`} className="text-sm font-medium text-accent-600">
          ← {course.title}
        </Link>
        <div className="mt-3">
          <ProgressBar percent={prog.percent} />
          <p className="mt-1.5 text-xs text-slate-500">
            {prog.done} / {prog.total} lessons
          </p>
        </div>
        <nav className="mt-5 space-y-4">
          {course.modules.map((m) => (
            <div key={m.id}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{m.title}</p>
              <ul className="space-y-0.5">
                {m.lessons.map((l) => {
                  const isDone = completed.has(l.id);
                  const active = l.id === lesson.id;
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/learn/${slug}/${l.id}`}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
                          active ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-700" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                        )}
                        <span className="line-clamp-2">{l.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* lesson body */}
      <article className="min-w-0">
        <p className="text-sm text-slate-400">{lesson.moduleTitle}</p>
        <h1 className="mt-1 font-display text-3xl font-bold">{lesson.title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <Clock className="h-4 w-4" /> about {lesson.estMinutes} min
        </p>

        {resources.length > 0 ? (
          <div className="mt-6 space-y-3">
            {resources.map((r) => (
              <ResourceView key={r.id} resource={r} />
            ))}
          </div>
        ) : null}

        <div className="mt-6">
          {lesson.contentMarkdown?.trim() ? (
            <Markdown>{lesson.contentMarkdown}</Markdown>
          ) : (
            <p className="text-sm text-slate-400">No written notes for this lesson yet.</p>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
          {enrollment ? <MarkCompleteButton lessonId={lesson.id} done={done} /> : <span />}
          <div className="flex gap-2">
            {prev ? (
              <Link href={`/learn/${slug}/${prev.id}`} className="btn-secondary">
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
            ) : null}
            {next ? (
              <Link href={`/learn/${slug}/${next.id}`} className="btn-secondary">
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href={`/courses/${slug}`} className="btn-secondary">
                Finish <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
