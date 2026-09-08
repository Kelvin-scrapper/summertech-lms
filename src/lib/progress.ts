import { prisma } from './prisma';

export type CourseTree = Awaited<ReturnType<typeof getCourseTree>>;

export function getCourseTree(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      instructors: { select: { id: true, name: true, email: true } },
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
}

/** Flattened, ordered lesson list for a course tree. */
export function flattenLessons(course: NonNullable<CourseTree>) {
  return course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title })),
  );
}

/** Per-user progress for one course: set of completed lesson ids + percent. */
export async function courseProgress(userId: string, course: NonNullable<CourseTree>) {
  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  if (lessonIds.length === 0) return { completed: new Set<string>(), percent: 0, total: 0, done: 0 };

  const rows = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: lessonIds } },
    select: { lessonId: true },
  });
  const completed = new Set(rows.map((r) => r.lessonId));
  const done = completed.size;
  const total = lessonIds.length;
  return { completed, done, total, percent: Math.round((done / total) * 100) };
}

/** The next lesson a user should do in a course (first incomplete), or null if finished. */
export function nextLesson(course: NonNullable<CourseTree>, completed: Set<string>) {
  for (const m of course.modules) {
    for (const l of m.lessons) {
      if (!completed.has(l.id)) return { lesson: l, module: m };
    }
  }
  return null;
}
