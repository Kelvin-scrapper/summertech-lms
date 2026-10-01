import { cache } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { load } from '@/lib/api';
import type { EditableCourse } from '@/lib/types';
import CourseEditor from '@/components/CourseEditor';

const getCourse = cache((slug: string) => load<EditableCourse>(`/teach/courses/${encodeURIComponent(slug)}`));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `Edit · ${(await getCourse(slug)).title}` };
}

export default async function TeachCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/teach" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-600">
        <ArrowLeft className="h-4 w-4" /> All courses
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{course.title}</h1>
          <p className="mt-1 text-slate-500">Add and reorder modules, lessons, notes and resources.</p>
        </div>
        <Link href={`/courses/${course.slug}`} className="btn-secondary shrink-0">
          <Eye className="h-4 w-4" /> Preview
        </Link>
      </div>

      <div className="mt-8">
        <CourseEditor course={course} />
      </div>
    </div>
  );
}
