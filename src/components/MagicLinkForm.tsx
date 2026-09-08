'use client';

import { useActionState } from 'react';
import { requestMagicLink } from '@/lib/actions';
import type { FormState } from '@/lib/form';

const initial: FormState = {};

export default function MagicLinkForm() {
  const [state, action, pending] = useActionState(requestMagicLink, initial);

  if (state.ok) {
    return (
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-900">
        {state.message}
        <p className="mt-2 text-slate-600">
          On a local dev server with no email configured, the link is printed in the terminal.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@summertech.ac.ke" />
      </div>
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Email me a sign-in link'}
      </button>
      <p className="text-center text-xs text-slate-500">
        Accounts are created by an administrator. No public sign-up.
      </p>
    </form>
  );
}
