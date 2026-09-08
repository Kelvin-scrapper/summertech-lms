'use client';

import { useActionState } from 'react';
import { signInWithPassword } from '@/lib/actions';
import type { FormState } from '@/lib/form';

const initial: FormState = {};

export default function PasswordLoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInWithPassword, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? '/dashboard'} />
      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@summertech.ac.ke" />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      {state.error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
