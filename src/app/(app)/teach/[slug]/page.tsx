import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Eye } from 'lucide-react';
import { requireRole, teachesCourse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CourseEditor from '@/components/CourseEditor';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await prisma.course.findUnique({ where: { slug }, select: { title: true } });
  return { title: c ? `Edit · ${c.title}` : 'Edit course' };
}

export default async function TeachCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireRole(['INSTRUCTOR', 'ADMIN']);
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { resources: { orderBy: { order: 'asc' } } },
          },
        },
      },
    },
  });
  if (!course) notFound();
  if (!(await teachesCourse(user.id, course.id))) redirect('/teach');

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
