'use client';

import { useState } from 'react';
import { useProgress } from '@/lib/progress-context';
import { CheckCheckIcon, CheckIcon } from '@/components/ui/Icon';

export function CompleteButton({ lessonId }: { lessonId: string }) {
  const { isCompleted, markComplete } = useProgress();
  const [submitting, setSubmitting] = useState(false);
  const done = isCompleted(lessonId);

  return (
    <button
      onClick={() => {
        setSubmitting(true);
        // Tiny artificial delay so the "Saving…" state is visible.
        // The actual localStorage write is synchronous.
        setTimeout(() => {
          markComplete(lessonId);
          setSubmitting(false);
        }, 150);
      }}
      disabled={submitting || done}
      className="lx-btn lx-btn-secondary"
    >
      {done ? (
        <>
          <CheckIcon size={14} /> Marked complete
        </>
      ) : submitting ? (
        'Saving…'
      ) : (
        <>
          <CheckCheckIcon size={14} /> Mark lesson complete
        </>
      )}
    </button>
  );
}
