'use client';

import { useTransition } from 'react';
import { ArrowRight } from 'lucide-react';
import { enroll } from '@/lib/actions';

export default function EnrollButton({ courseId }: { courseId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn-primary"
      disabled={pending}
      onClick={() => start(() => enroll(courseId))}
    >
      {pending ? 'Enrolling…' : 'Enrol in this course'}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}
