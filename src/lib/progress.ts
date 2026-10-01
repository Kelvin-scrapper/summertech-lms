import type { CourseTree, LessonOutline } from './types';

export type FlatLesson = LessonOutline & { moduleTitle: string };

/** All lessons of a course in reading order. */
export function flattenLessons(course: CourseTree): FlatLesson[] {
  return course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
}
