'use client';

import { useState, useTransition } from 'react';
import { useProgress } from '@/lib/progress-context';
import { ResetIcon } from '@/components/ui/Icon';

export function ResetProgressButton() {
  const { reset } = useProgress();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(() => {
      reset();
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="lx-btn lx-btn-ghost lx-btn-sm text-slate-400"
        title="Reset all progress on this browser"
      >
        <ResetIcon size={14} /> Reset
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs">
      <span className="text-amber-200">Erase all progress?</span>
      <button
        onClick={confirm}
        disabled={pending}
        className="rounded bg-amber-400/90 px-2 py-0.5 font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-50"
      >
        {pending ? '…' : 'Yes'}
      </button>
      <button
        onClick={() => setOpen(false)}
        disabled={pending}
        className="rounded px-2 py-0.5 text-slate-300 hover:bg-slate-800"
      >
        Cancel
      </button>
    </div>
  );
}
