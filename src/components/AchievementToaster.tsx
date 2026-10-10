'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AchievementBadge } from './AchievementBadge';
import { useProgress } from '@/lib/progress-context';
import { ACHIEVEMENTS, type Achievement } from '@/lib/achievements';
import { CloseIcon, SparklesIcon } from '@/components/ui/Icon';

const DISPLAY_MS = 5000;
const EXIT_MS = 200;
const GAP_MS = 250;

/**
 * Listens for newly-unlocked achievements (tracked by the progress
 * context) and surfaces a small toast, one at a time. Unlocking several
 * achievements in the same update (e.g. finishing the last lesson
 * satisfies both "Graduate" and the hidden "Completionist" at once)
 * queues each one its own toast instead of only ever showing the first
 * and silently dropping the rest. Hovering or focusing the toast pauses
 * its timer.
 */
export function AchievementToaster() {
  const { newlyUnlocked, clearNewlyUnlocked, ready } = useProgress();
  const [queue, setQueue] = useState<AchievementToast[]>([]);
  const [current, setCurrent] = useState<AchievementToast | null>(null);
  const [exiting, setExiting] = useState(false);
  const [paused, setPaused] = useState(false);

  // Drain the shared `newlyUnlocked` array into this component's own
  // queue immediately, so a shared `clearNewlyUnlocked()` call (which
  // always clears the whole array) never discards a toast this
  // component hasn't shown yet.
  useEffect(() => {
    if (!ready || newlyUnlocked.length === 0) return;
    const toasts = newlyUnlocked
      .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => !!a)
      .map((a) => ({ id: a.id, title: a.title, description: a.description, glyph: a.glyph }));
    setQueue((q) => [...q, ...toasts]);
    clearNewlyUnlocked();
  }, [newlyUnlocked, clearNewlyUnlocked, ready]);

  // Pull the next toast off the queue once the slot is free.
  useEffect(() => {
    if (current || exiting || queue.length === 0) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setCurrent(next);
    setPaused(false);
  }, [current, exiting, queue]);

  // Auto-advance: show for DISPLAY_MS (restarting after a pause), play
  // the exit animation, then leave a short gap before the next toast.
  useEffect(() => {
    if (!current || paused) return;
    const showTimer = setTimeout(() => setExiting(true), DISPLAY_MS);
    return () => clearTimeout(showTimer);
  }, [current, paused]);

  useEffect(() => {
    if (!exiting) return;
    const exitTimer = setTimeout(() => {
      setCurrent(null);
      setExiting(false);
    }, EXIT_MS + GAP_MS);
    return () => clearTimeout(exitTimer);
  }, [exiting]);

  if (!current) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`lx-popover fixed inset-x-3 top-[4.25rem] z-50 border-lx-accent/40 p-3 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-auto sm:w-80 ${
        exiting ? 'lx-toast-out' : 'lx-toast-in'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-lx-accent/50 bg-lx-accent/15 text-lx-accent"
        >
          <AchievementBadge glyph={current.glyph} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-lx-accent">
            <SparklesIcon size={12} /> Achievement unlocked
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-lx-fg">{current.title}</p>
          <p className="text-xs text-lx-muted">{current.description}</p>
          <Link
            href="/achievements"
            onClick={() => setExiting(true)}
            className="mt-1.5 inline-block text-xs font-medium text-lx-accent hover:underline"
          >
            See all badges
          </Link>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setExiting(true)}
          className="rounded-md p-1 text-lx-subtle transition hover:bg-lx-surface hover:text-lx-fg"
        >
          <CloseIcon size={14} />
        </button>
      </div>
    </div>
  );
}

interface AchievementToast {
  id: string;
  title: string;
  description: string;
  glyph: Achievement['glyph'];
}
