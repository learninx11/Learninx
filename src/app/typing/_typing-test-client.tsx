'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  ClockIcon,
  GamepadIcon,
  ResetIcon,
  TargetIcon,
  TrophyIcon,
} from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { TYPING_SNIPPETS } from '@/lib/typing-snippets';
import { useProgress } from '@/lib/progress-context';
import type { TypingScore } from '@/lib/progress-types';

type Status = 'idle' | 'running' | 'finished';

function pickSnippet(previous?: string): string {
  if (TYPING_SNIPPETS.length === 0) return 'ls -la';
  if (TYPING_SNIPPETS.length === 1) return TYPING_SNIPPETS[0] as string;
  let next: string | undefined = previous;
  // Roll a few times to avoid repeating the previous one.
  for (let i = 0; i < 4 && next === previous; i += 1) {
    next = TYPING_SNIPPETS[Math.floor(Math.random() * TYPING_SNIPPETS.length)];
  }
  return next ?? TYPING_SNIPPETS[0]!;
}

/**
 * Standard "5 words = 1 word" approximation used by every typing
 * tutor. The snippet is just a string of characters; we count word
 * boundaries the way a typing tutor would.
 */
function wordsTyped(text: string): number {
  return text.length === 0 ? 0 : Math.max(1, Math.ceil(text.length / 5));
}

export function TypingTestClient() {
  const { state, ready, recordTyping } = useProgress();
  const [snippet, setSnippet] = useState<string>(() => pickSnippet());
  const [typed, setTyped] = useState<string>('');
  const [status, setStatus] = useState<Status>('idle');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [lastScore, setLastScore] = useState<TypingScore | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef<boolean>(false);

  // Ticker while the test runs so the seconds counter stays live.
  useEffect(() => {
    if (status !== 'running') {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    tickRef.current = setInterval(() => {
      if (startedAt != null) setElapsedMs(Date.now() - startedAt);
    }, 100);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [status, startedAt]);

  const remaining = snippet.length - typed.length;
  const accuracy = useMemo(() => {
    if (typed.length === 0) return 100;
    let correct = 0;
    for (let i = 0; i < typed.length; i += 1) {
      if (typed[i] === snippet[i]) correct += 1;
    }
    return Math.round((correct / typed.length) * 100);
  }, [typed, snippet]);

  const liveWpm = useMemo(() => {
    if (elapsedMs <= 0) return 0;
    const minutes = elapsedMs / 60_000;
    return Math.round(wordsTyped(typed) / minutes);
  }, [typed, elapsedMs]);

  const reset = useCallback(
    (nextSnippet: string = pickSnippet()) => {
      finishedRef.current = false;
      setSnippet(nextSnippet);
      setTyped('');
      setStatus('idle');
      setStartedAt(null);
      setElapsedMs(0);
      setLastScore(null);
      // Defer focus so the DOM has the new input.
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [],
  );

  function start() {
    setStatus('running');
    const t = Date.now();
    setStartedAt(t);
    setElapsedMs(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function commit() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const totalMs = startedAt == null ? 0 : Date.now() - startedAt;
    const minutes = totalMs / 60_000 || 1 / 60_000;
    const wpm = Math.round(wordsTyped(typed) / minutes);
    let correct = 0;
    for (let i = 0; i < typed.length; i += 1) {
      if (typed[i] === snippet[i]) correct += 1;
    }
    const finalAccuracy =
      typed.length === 0 ? 0 : Math.round((correct / typed.length) * 100);
    const score: TypingScore = {
      wpm,
      accuracy: finalAccuracy,
      length: snippet.length,
      at: Date.now(),
    };
    setLastScore(score);
    setStatus('finished');
    if (ready) recordTyping(score);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (status === 'finished') return;
    const value = e.target.value;
    if (status === 'idle' && value.length > 0) start();
    if (status === 'running' && value.length > snippet.length) return;
    setTyped(value);
    if (value === snippet) {
      // Defer the commit so the final character paints first.
      setTimeout(commit, 0);
    }
  }

  return (
    <div className="space-y-12">
      <header className="space-y-3 pt-6 text-center sm:pt-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 font-mono text-xs text-[var(--lx-accent)]">
          <GamepadIcon size={12} /> ~/typing $ time bash
        </div>
        <h1 className="text-balance text-3xl font-bold sm:text-4xl">Typing test</h1>
        <p className="mx-auto max-w-2xl text-pretty text-sm text-slate-400 sm:text-base">
          Type the command exactly as shown, as fast and as accurately as you can.
          Hitting 30 WPM unlocks the <em>Fast fingers</em> badge; 60 WPM unlocks{' '}
          <em>Lightning</em>.
        </p>
      </header>

      <section className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="WPM" value={liveWpm} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Time" value={formatSeconds(elapsedMs)} />
        </div>
      </section>

      <section className="lx-card space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Pill tone="accent">
            <TargetIcon size={12} /> Round {Math.floor(Math.random() * 999) + 1}
          </Pill>
          <button
            type="button"
            onClick={() => reset()}
            className="lx-btn lx-btn-ghost lx-btn-sm"
            title="Pick a new snippet"
          >
            <ResetIcon size={12} /> New snippet
          </button>
        </div>

        <p
          className="font-mono text-lg leading-relaxed sm:text-2xl"
          aria-hidden
        >
          {snippet.split('').map((ch, idx) => {
            const userChar = typed[idx];
            const state =
              userChar == null
                ? 'pending'
                : userChar === ch
                  ? 'correct'
                  : 'wrong';
            return (
              <span
                key={idx}
                className={
                  state === 'correct'
                    ? 'text-emerald-300'
                    : state === 'wrong'
                      ? 'text-rose-400 underline decoration-rose-500/60 underline-offset-2'
                      : 'text-slate-500'
                }
              >
                {ch}
              </span>
            );
          })}
        </p>

        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={onChange}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={status === 'idle' ? 'Start typing to begin…' : ''}
          aria-label="Type the command"
          className="lx-input w-full font-mono"
          disabled={status === 'finished'}
        />

        <p className="text-xs text-slate-500">
          {status === 'idle' && 'Press a key to start the timer.'}
          {status === 'running' && `${remaining} character${remaining === 1 ? '' : 's'} left.`}
          {status === 'finished' && lastScore && (
            <>
              Round over: <strong>{lastScore.wpm} WPM</strong> at{' '}
              <strong>{lastScore.accuracy}%</strong> accuracy.
            </>
          )}
        </p>

        {status === 'finished' && lastScore && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => reset()}
              className="lx-btn lx-btn-primary"
            >
              <ArrowRightIcon size={14} /> Try another
            </button>
            <Link href="/achievements" className="lx-btn lx-btn-secondary">
              <TrophyIcon size={14} /> See your badges
            </Link>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="default">
              <ClockIcon size={12} /> Best on this browser
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Personal best</h2>
          </div>
        </div>
        <div className="lx-card p-5 sm:p-6">
          {ready && state.bestTyping ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Best WPM" value={state.bestTyping.wpm} />
              <Stat label="Best accuracy" value={`${state.bestTyping.accuracy}%`} />
              <Stat label="Snippet length" value={state.bestTyping.length} />
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No runs yet on this browser. Finish a snippet to set a baseline.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="lx-card flex flex-col items-center gap-1 p-4 text-center">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-2xl font-semibold text-[var(--lx-fg)]">{value}</span>
    </div>
  );
}

function formatSeconds(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}
