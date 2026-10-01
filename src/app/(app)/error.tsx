'use client';

import { RotateCcw } from 'lucide-react';

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-2 font-display text-2xl font-bold">We couldn&apos;t complete that</h1>
      <p className="mt-2 text-sm text-slate-500">
        The LMS couldn&apos;t reach its server or the change was refused. Try again in a moment.
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        <RotateCcw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}
