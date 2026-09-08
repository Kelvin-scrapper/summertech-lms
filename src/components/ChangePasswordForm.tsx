'use client';

import { useActionState } from 'react';
import { changePassword } from '@/lib/actions';
import type { FormState } from '@/lib/form';

const initial: FormState = {};

export default function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState(changePassword, initial);

  return (
    <form action={action} className="max-w-sm space-y-3">
      {hasPassword ? (
        <div>
          <label htmlFor="current" className="label">
            Current password
          </label>
          <input id="current" name="current" type="password" autoComplete="current-password" className="input" required />
        </div>
      ) : null}
      <div>
        <label htmlFor="next" className="label">
          {hasPassword ? 'New password' : 'Set a password'}
        </label>
        <input id="next" name="next" type="password" autoComplete="new-password" className="input" required minLength={8} />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-brand-700">{state.message}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? 'Saving…' : hasPassword ? 'Change password' : 'Set password'}
      </button>
    </form>
  );
}
