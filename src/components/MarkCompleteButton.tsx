'use client';

import { useTransition } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { setLessonComplete } from '@/lib/actions';

export default function MarkCompleteButton({ lessonId, done }: { lessonId: string; done: boolean }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => setLessonComplete(lessonId, !done))}
      className={done ? 'btn-secondary' : 'btn-primary'}
    >
      {done ? (
        <>
          <RotateCcw className="h-4 w-4" /> Mark as not done
        </>
      ) : (
        <>
          <Check className="h-4 w-4" /> Mark complete
        </>
      )}
    </button>
  );
}
