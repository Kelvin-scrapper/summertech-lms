'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  BookOpen,
  LifeBuoy,
  Settings,
  GraduationCap,
  SquarePen,
  ShieldCheck,
} from 'lucide-react';
import type { Role } from '@prisma/client';
import SignOutButton from './SignOutButton';

const base = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'All Courses', icon: BookOpen },
  { href: '/help', label: 'Help Center', icon: LifeBuoy },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  const links = [...base];
  if (role === 'INSTRUCTOR' || role === 'ADMIN') {
    links.splice(2, 0, { href: '/teach', label: 'Teaching', icon: SquarePen });
  }
  if (role === 'ADMIN') {
    links.splice(3, 0, { href: '/admin', label: 'Admin', icon: ShieldCheck });
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent-600 text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="font-display text-lg font-bold">Summertech</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <SignOutButton />
      </div>
    </aside>
  );
}
