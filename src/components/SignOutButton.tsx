'use client';

import { LogOut } from 'lucide-react';
import { signOut } from '@/lib/actions';

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </form>
  );
}
