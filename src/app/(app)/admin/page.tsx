import Link from 'next/link';
import type { Metadata } from 'next';
import { Users, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { load } from '@/lib/api';
import { ROLES, type Stats } from '@/lib/types';

export const metadata: Metadata = { title: 'Admin' };

export default async function AdminHome() {
  const { users, courses, enrollments, usersByRole } = await load<Stats>('/stats');

  const stats = [
    { label: 'Users', value: users, icon: Users },
    { label: 'Courses', value: courses, icon: BookOpen },
    { label: 'Enrolments', value: enrollments, icon: GraduationCap },
  ];

  const links = [
    { href: '/admin/users', title: 'Users', desc: 'Create accounts, set roles' },
    { href: '/admin/enrollments', title: 'Enrolments', desc: 'Put learners into courses' },
    { href: '/admin/courses', title: 'Courses', desc: 'Assign tutors to courses' },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Admin</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <s.icon className="h-5 w-5 text-slate-400" />
            <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {ROLES
          .map((r) => `${usersByRole[r] ?? 0} ${r.toLowerCase()}`)
          .join(' · ')}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="card flex flex-col p-5 transition-colors hover:border-slate-300">
            <h2 className="font-display text-lg font-bold">{l.title}</h2>
            <p className="mt-1 flex-1 text-sm text-slate-500">{l.desc}</p>
            <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-accent-600">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
