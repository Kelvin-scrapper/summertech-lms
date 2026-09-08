'use client';

import { useActionState } from 'react';
import { updateName } from '@/lib/actions';
import type { FormState } from '@/lib/form';

const initial: FormState = {};

export default function NameForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(updateName, initial);

  return (
    <form action={action} className="max-w-sm space-y-3">
      <div>
        <label htmlFor="name" className="label">
          Display name
        </label>
        <input id="name" name="name" defaultValue={defaultName} required className="input" />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-brand-700">{state.message}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
