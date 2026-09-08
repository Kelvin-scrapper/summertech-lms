'use client';

import { useActionState } from 'react';
import { UserPlus } from 'lucide-react';
import { adminCreateUser } from '@/lib/actions';
import type { FormState } from '@/lib/form';

const initial: FormState = {};

export default function AdminCreateUserForm() {
  const [state, action, pending] = useActionState(adminCreateUser, initial);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input name="name" required className="input" placeholder="Jane Mwangi" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" required className="input" placeholder="jane@summertech.ac.ke" />
        </div>
        <div>
          <label className="label">Role</label>
          <select name="role" className="input" defaultValue="STUDENT">
            <option value="STUDENT">Student</option>
            <option value="MENTOR">Mentor</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="label">Initial password (optional)</label>
          <input name="password" type="text" minLength={8} className="input" placeholder="≥ 8 chars, or leave blank for magic-link only" />
        </div>
      </div>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-brand-700">{state.message}</p> : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        <UserPlus className="h-4 w-4" />
        {pending ? 'Creating…' : 'Create & approve user'}
      </button>
    </form>
  );
}
