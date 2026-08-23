'use client';

import { useEffect, useState } from 'react';
import { AchievementBadge } from './AchievementBadge';
import { useProgress } from '@/lib/progress-context';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { CloseIcon, SparklesIcon } from '@/components/ui/Icon';

/**
 * Listens for newly-unlocked achievements (tracked by the progress
 * context) and surfaces a small toast in the bottom-right corner. The
 * toast dismisses itself after a few seconds or on click.
 */
export function AchievementToaster() {
  const { newlyUnlocked, clearNewlyUnlocked, ready } = useProgress();
  const [visible, setVisible] = useState<AchievementToast | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (newlyUnlocked.length === 0) {
      setVisible(null);
      return;
    }
    const id = newlyUnlocked[0];
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) {
      clearNewlyUnlocked();
      return;
    }
    setVisible({ id, title: def.title, description: def.description, glyph: def.glyph });
    const timer = setTimeout(() => {
      setVisible(null);
      clearNewlyUnlocked();
    }, 4500);
    return () => clearTimeout(timer);
  }, [newlyUnlocked, clearNewlyUnlocked, ready]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--lx-accent)]/40 bg-slate-900/95 p-3 shadow-xl backdrop-blur"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--lx-accent)]/50 bg-[var(--lx-accent)]/15 text-[var(--lx-accent)]"
        >
          <AchievementBadge glyph={visible.glyph} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-[var(--lx-accent)]">
            <SparklesIcon size={12} /> Achievement unlocked
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold">{visible.title}</p>
          <p className="text-xs text-slate-400">{visible.description}</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            setVisible(null);
            clearNewlyUnlocked();
          }}
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
  glyph: 'rocket' | 'book' | 'streak' | 'quiz' | 'boss' | 'bookmark' | 'note' | 'trophy' | 'share' | 'typing' | 'first' | 'perfectionist';
}
