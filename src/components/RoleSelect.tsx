'use client';

import { useTransition } from 'react';
import type { Role } from '@prisma/client';
import { adminSetRole } from '@/lib/actions';

const ROLES: Role[] = ['STUDENT', 'MENTOR', 'INSTRUCTOR', 'ADMIN'];

export default function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: Role;
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <select
      defaultValue={role}
      disabled={disabled || pending}
      onChange={(e) => {
        const next = e.target.value as Role;
        start(() => adminSetRole(userId, next));
      }}
      className="input w-36 py-1.5 text-sm"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r[0] + r.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}
