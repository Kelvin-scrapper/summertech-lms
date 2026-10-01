import Link from 'next/link';
import { BookOpen, Check } from 'lucide-react';
import type { Metadata } from 'next';
import { load } from '@/lib/api';
import type { CourseListItem } from '@/lib/types';

export const metadata: Metadata = { title: 'All Courses' };

const areaBadge: Record<string, string> = {
  'Web Development': 'bg-emerald-100 text-emerald-700',
  Design: 'bg-pink-100 text-pink-700',
  Foundations: 'bg-blue-100 text-blue-700',
  AI: 'bg-purple-100 text-purple-700',
};

export default async function CoursesPage() {
  const courses = await load<CourseListItem[]>('/courses');

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-bold">All Courses</h1>
      <p className="mt-1 text-slate-500">Every programme offered on Summertech.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {courses.map((c) => (
          <Link
            key={c.id}
            href={`/courses/${c.slug}`}
            className="card group flex flex-col p-5 transition-colors hover:border-slate-300"
          >
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${areaBadge[c.area] ?? 'bg-slate-100 text-slate-700'}`}>
                {c.area}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{c.tier}</span>
              {c.enrolled ? (
                <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-brand-700">
                  <Check className="h-3.5 w-3.5" /> Enrolled
                </span>
              ) : null}
            </div>

            <h2 className="mt-3 font-display text-lg font-bold group-hover:text-brand-800">{c.title}</h2>
            <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{c.description}</p>

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> {c.moduleCount} modules
              </span>
              <span>{c.durationText}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
