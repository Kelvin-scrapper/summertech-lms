// Shapes returned by the Summertech LMS API (dates arrive as ISO strings).

export type Role = 'STUDENT' | 'MENTOR' | 'INSTRUCTOR' | 'ADMIN';
export type ResourceKind = 'VIDEO' | 'PDF' | 'SLIDES' | 'LINK' | 'OTHER';
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED';

export const ROLES: Role[] = ['STUDENT', 'MENTOR', 'INSTRUCTOR', 'ADMIN'];

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  active: boolean;
  hasPassword: boolean;
  emailVerified: string | null;
  createdAt: string;
};

export type AdminUser = User & { enrollmentCount: number; teachingCount: number };

export type Person = { id: string; name: string | null; email: string };

export type Resource = {
  id: string;
  lessonId: string;
  kind: ResourceKind;
  title: string;
  url: string;
  sizeBytes: number | null;
  order: number;
};

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  area: string;
  tier: string;
  description: string;
  durationText: string;
};

export type CourseListItem = CourseSummary & {
  order: number;
  instructors: Person[];
  moduleCount: number;
  enrolled: boolean;
  enrollmentCount?: number;
};

// Lesson notes and resources are only present for enrolled learners and tutors.
export type LessonOutline = {
  id: string;
  title: string;
  order: number;
  estMinutes: number;
  resourceCount: number;
  contentMarkdown?: string;
  resources?: Resource[];
};

export type ModuleOutline = { id: string; title: string; order: number; lessons: LessonOutline[] };

export type CourseTree = CourseSummary & { instructors: Person[]; modules: ModuleOutline[] };

export type Progress = { completedLessonIds: string[]; done: number; total: number; percent: number };

export type NextLesson = { lessonId: string; lessonTitle: string; moduleTitle: string } | null;

export type CourseDetail = {
  course: CourseTree;
  enrollment: { status: EnrollmentStatus; enrolledAt: string } | null;
  canEdit: boolean;
  progress: Progress;
  next: NextLesson;
};

export type LearningItem = {
  course: CourseSummary;
  status: EnrollmentStatus;
  progress: Omit<Progress, 'completedLessonIds'>;
  next: NextLesson;
};

export type EditableLesson = {
  id: string;
  title: string;
  order: number;
  estMinutes: number;
  contentMarkdown: string;
  resources: Resource[];
};

export type EditableCourse = CourseSummary & {
  modules: { id: string; title: string; order: number; lessons: EditableLesson[] }[];
};

export type TeachableCourse = CourseSummary & {
  moduleCount: number;
  lessonCount: number;
  enrollmentCount: number;
};

export type EnrollmentRow = {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  user: Person;
  course: { id: string; slug: string; title: string };
};

export type Stats = {
  users: number;
  courses: number;
  enrollments: number;
  usersByRole: Record<Role, number>;
};

export type Session = { user: User; token: string; expiresAt: string };
