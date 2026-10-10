'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useProgress } from '@/lib/progress-context';
import { CheckCheckIcon, CheckIcon, CloseIcon, LightbulbIcon } from '@/components/ui/Icon';

export function ChallengeRunner({
  lessonId,
  lessonSolution,
}: {
  lessonId: string;
  lessonSolution?: string;
}) {
  const { isCompleted, submitChallenge } = useProgress();
  const completed = isCompleted(lessonId);
  const [command, setCommand] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [reveal, setReveal] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();
  const statusId = useId();

  // Build a friendlier hint: show the first accepted form, with everything
  // past the command name masked.
  //   "mkdir lab && touch lab/notes.txt"  ->  "mkdir ..."
  //   "chmod 700 script.sh"               ->  "chmod ..."
  const hint = lessonSolution ? buildHint(lessonSolution) : null;

  // If the user reset their progress externally, clear any stale status.
  useEffect(() => {
    if (!completed) setStatus(null);
  }, [completed]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!command.trim()) return;
    const result = submitChallenge(lessonId, lessonSolution, command);
    setStatus(result);
    if (!result.ok) inputRef.current?.select();
  }

  const failed = status !== null && !status.ok;

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex flex-wrap items-stretch gap-2">
        <label htmlFor={inputId} className="sr-only">
          Your command
        </label>
        <div className="relative min-w-0 flex-1 basis-56">
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lx-accent"
          >
            $
          </span>
          <input
            id={inputId}
            ref={inputRef}
            value={command}
            onChange={(e) => {
              setCommand(e.target.value);
              if (failed) setStatus(null);
            }}
            placeholder={completed ? 'Solved — try another way if you like' : 'type the command…'}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={failed || undefined}
            aria-describedby={status ? statusId : undefined}
            className="lx-input pl-7"
          />
        </div>
        <button
          type="submit"
          disabled={completed || !command.trim()}
          className="lx-btn lx-btn-primary"
        >
          {completed ? (
            <>
              <CheckIcon size={14} /> Solved
            </>
          ) : (
            'Check'
          )}
        </button>
      </div>

      {hint && !completed && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-lx-subtle">
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-expanded={reveal}
            className="inline-flex items-center gap-1 rounded text-lx-accent hover:underline"
          >
            <LightbulbIcon size={12} /> {reveal ? 'Hide hint' : 'Need a hint?'}
          </button>
          {reveal && (
            <span className="inline-flex items-center gap-1.5">
              Start with
              <code className="rounded border border-lx-border bg-lx-code-bg px-2 py-0.5 font-mono text-lx-fg">
                {hint}
              </code>
            </span>
          )}
        </div>
      )}

      {status && !(status.ok && completed) && (
        <div
          id={statusId}
          role="status"
          aria-live="polite"
          className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
            status.ok
              ? 'border-lx-success/30 bg-lx-success/10 text-lx-success'
              : 'border-lx-warning/30 bg-lx-warning/10 text-lx-warning'
          }`}
        >
          <span aria-hidden className="mt-0.5">
            {status.ok ? <CheckIcon size={14} /> : <CloseIcon size={14} />}
          </span>
          <span>{status.message}</span>
        </div>
      )}

      {completed && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-lx-success/30 bg-lx-success/10 px-3 py-2 text-sm text-lx-success"
        >
          <CheckCheckIcon size={14} />
          <span>Challenge solved — the lesson is marked complete.</span>
        </div>
      )}
    </form>
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
