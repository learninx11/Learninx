'use client';

import { useState } from 'react';
import { markLessonCompleteAction } from '@/app/lessons/[slug]/actions';
import { CheckCheckIcon, CheckIcon } from '@/components/ui/Icon';

export function CompleteButton({ lessonId }: { lessonId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <button
      onClick={async () => {
        setSubmitting(true);
        try {
          await markLessonCompleteAction(lessonId);
          setDone(true);
        } finally {
          setSubmitting(false);
        }
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
