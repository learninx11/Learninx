'use client';

import { useEffect, useState } from 'react';
import { AchievementBadge } from './AchievementBadge';
import { useProgress } from '@/lib/progress-context';
import { ACHIEVEMENTS, type Achievement } from '@/lib/achievements';
import { CloseIcon, SparklesIcon } from '@/components/ui/Icon';

const DISPLAY_MS = 4500;
const EXIT_MS = 200;
const GAP_MS = 250;

/**
 * Listens for newly-unlocked achievements (tracked by the progress
 * context) and surfaces a small toast in the bottom-right corner, one
 * at a time. Unlocking several achievements in the same update (e.g.
 * finishing the last lesson satisfies both "Graduate" and the hidden
 * "Completionist" at once) queues each one its own toast instead of
 * only ever showing the first and silently dropping the rest.
 */
export function AchievementToaster() {
  const { newlyUnlocked, clearNewlyUnlocked, ready } = useProgress();
  const [queue, setQueue] = useState<AchievementToast[]>([]);
  const [current, setCurrent] = useState<AchievementToast | null>(null);
  const [exiting, setExiting] = useState(false);

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
  }, [current, exiting, queue]);

  // Auto-advance: show for DISPLAY_MS, play the exit animation, then
  // leave a short gap before the next toast (if any) appears.
  useEffect(() => {
    if (!current) return;
    const showTimer = setTimeout(() => setExiting(true), DISPLAY_MS);
    return () => clearTimeout(showTimer);
  }, [current]);

  useEffect(() => {
    if (!exiting) return;
    const exitTimer = setTimeout(() => {
      setCurrent(null);
      setExiting(false);
    }, EXIT_MS + GAP_MS);
    return () => clearTimeout(exitTimer);
  }, [exiting]);

  function dismiss() {
    setExiting(true);
  }

  if (!current) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--lx-accent)]/40 bg-slate-900/95 p-3 shadow-xl backdrop-blur ${
        exiting ? 'lx-toast-out' : 'lx-toast-in'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--lx-accent)]/50 bg-[var(--lx-accent)]/15 text-[var(--lx-accent)]"
        >
          <AchievementBadge glyph={current.glyph} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-[var(--lx-accent)]">
            <SparklesIcon size={12} /> Achievement unlocked
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold">{current.title}</p>
          <p className="text-xs text-slate-400">{current.description}</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismiss}
          className="rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
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
