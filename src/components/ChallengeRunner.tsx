'use client';

import { useEffect, useRef, useState } from 'react';
import { submitChallengeAction } from '@/app/lessons/[slug]/actions';
import { CheckCheckIcon, CheckIcon, CloseIcon } from '@/components/ui/Icon';

export function ChallengeRunner({
  lessonId,
  lessonSlug,
  lessonSolution,
  initiallyCompleted,
  onSuccess,
}: {
  lessonId: string;
  lessonSlug: string;
  lessonSolution?: string;
  initiallyCompleted: boolean;
  onSuccess?: () => void;
}) {
  const [command, setCommand] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [submitting, setSubmitting] = useState(false);
  const [reveal, setReveal] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCompleted(initiallyCompleted);
  }, [initiallyCompleted]);

  // Build a friendlier hint: show the first accepted form, with everything
  // past the command name masked.
  //   "mkdir lab && touch lab/notes.txt"  ->  "mkdir ..."
  //   "chmod 700 script.sh"               ->  "chmod ..."
  const hint = lessonSolution ? buildHint(lessonSolution) : null;

  async function submit(): Promise<void> {
    if (!command.trim()) return;
    setSubmitting(true);
    try {
      const result = await submitChallengeAction(lessonId, lessonSlug, command);
      setStatus(result);
      if (result.ok) {
        setCompleted(true);
        onSuccess?.();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-stretch gap-2">
        <label htmlFor="challenge-cmd" className="sr-only">
          Solution command
        </label>
        <span
          aria-hidden
          className="inline-flex items-center rounded-md border border-slate-700 bg-slate-950 px-3 font-mono text-[var(--lx-accent)]"
        >
          $
        </span>
        <input
          id="challenge-cmd"
          ref={inputRef}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="type the solution command…"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="lx-input min-w-0 flex-1"
        />
        <button
          onClick={submit}
          disabled={submitting || completed}
          className="lx-btn lx-btn-primary"
        >
          {submitting ? 'Checking…' : completed ? 'Solved' : 'Check'}
        </button>
      </div>

      {hint && !completed && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Need a nudge?</span>
          <button
            onClick={() => setReveal((v) => !v)}
            className="text-[var(--lx-accent)] hover:underline"
          >
            {reveal ? 'Hide hint' : 'Show hint'}
          </button>
          {reveal && (
            <code className="rounded border border-slate-700 bg-slate-950 px-2 py-0.5 font-mono text-slate-200">
              {hint}
            </code>
          )}
        </div>
      )}

      {status && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
            status.ok
              ? 'border-[var(--lx-success)]/30 bg-[var(--lx-success)]/10 text-[var(--lx-success)]'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          }`}
        >
          <span aria-hidden className="mt-0.5">
            {status.ok ? <CheckIcon size={14} /> : <CloseIcon size={14} />}
          </span>
          <span>{status.message}</span>
        </div>
      )}

      {completed && (
        <div className="lx-pulse-success flex items-center gap-2 rounded-md border border-[var(--lx-success)]/30 bg-[var(--lx-success)]/10 px-3 py-2 text-sm text-[var(--lx-success)]">
          <CheckCheckIcon size={14} />
          <span>Lesson marked complete. On to the next one.</span>
        </div>
      )}
    </div>
  );
}

/**
 * Build a "hinted" version of the solution that doesn't spoil the answer.
 * We only show the *first* accepted form (pipe `||` splits alternatives).
 * Then we keep the first token and mask everything else.
 *   "mkdir lab && touch lab/notes.txt"  ->  "mkdir ..."
 *   "chmod 700 script.sh"               ->  "chmod ..."
 *   "ps aux | grep root"                ->  "ps ..."
 */
function buildHint(solution: string): string {
  const first = solution.split('||')[0]?.trim() ?? '';
  if (!first) return solution;
  // Split on common shell operators so we only mask the first command.
  const segments = first.split(/\s*(?:&&|\|\||;|\|)\s*/);
  const head = segments[0]?.trim() ?? '';
  const parts = head.split(/\s+/);
  if (parts.length === 0) return first;
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ...`;
}
