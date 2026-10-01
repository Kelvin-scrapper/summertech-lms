'use client';

import { LogOut } from 'lucide-react';
import { signOut } from '@/lib/actions';

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-brand-100/70 transition-colors hover:bg-white/5 hover:text-white">
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </form>
  );
}
