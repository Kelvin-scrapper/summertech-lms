'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  LifeBuoy,
  Settings,
  GraduationCap,
  SquarePen,
  ShieldCheck,
} from 'lucide-react';
import type { Role } from '@/lib/types';
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

  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed left-4 top-3.5 z-30 grid h-9 w-9 place-items-center rounded-full bg-brand-950 text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
      ) : null}

    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-950 text-brand-50 transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
          <GraduationCap className="h-5 w-5 text-accent-500" />
        </div>
        <span className="font-display text-lg font-bold tracking-tight text-white">Summertech</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="ml-auto grid h-8 w-8 place-items-center rounded-full text-brand-100/70 hover:bg-white/10 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-white/10 text-white' : 'text-brand-100/70 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className={clsx('h-4 w-4', active && 'text-accent-500')} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <SignOutButton />
      </div>
    </aside>
    </>
  );
}
