'use client';

import { useTransition } from 'react';
import { adminSetActive } from '@/lib/actions';

export default function ActiveToggle({
  userId,
  active,
  disabled,
}: {
  userId: string;
  active: boolean;
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() => start(() => adminSetActive(userId, !active))}
      className={
        active
          ? 'rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 hover:bg-brand-100 disabled:opacity-50'
          : 'rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50'
      }
    >
      {pending ? '…' : active ? 'Active' : 'Suspended'}
    </button>
  );
}
