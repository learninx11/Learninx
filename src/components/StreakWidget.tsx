'use client';

import { FireIcon, StarIcon, TargetIcon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { useProgress } from '@/lib/progress-context';

interface Props {
  variant?: 'card' | 'inline';
}

/**
 * Shows the current streak, lifetime points, and total completions
 * (lifetime). Server-renders the empty state so the static HTML
 * matches the first client render.
 */
export function StreakWidget({ variant = 'card' }: Props) {
  const { state, ready } = useProgress();
  const s = state.streak;
  const visible = ready
    ? s
    : {
        current: 0,
        best: 0,
        lastActiveDay: null,
        totalCompletions: 0,
        totalCorrect: 0,
        points: 0,
      };

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Pill tone="accent">
          <FireIcon size={10} /> {visible.current}-day streak
        </Pill>
        <Pill tone="default">
          <StarIcon size={10} /> {visible.points} pts
        </Pill>
        <Pill tone="default">
          <TargetIcon size={10} /> {visible.totalCompletions} done
        </Pill>
      </div>
    );
  }

  return (
    <div className="lx-card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Pill tone="accent">
          <FireIcon size={12} /> Streak
        </Pill>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-4xl font-bold text-[var(--lx-accent)]">
          {visible.current}
        </span>
        <span className="text-sm text-[var(--lx-muted)]">
          day{visible.current === 1 ? '' : 's'} in a row
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--lx-muted)]">
        Best streak so far: {visible.best} day{visible.best === 1 ? '' : 's'}.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <Stat label="Points" value={visible.points} />
        <Stat label="Lessons" value={visible.totalCompletions} />
        <Stat label="Correct" value={visible.totalCorrect} />
      </div>
      <p className="mt-3 text-[0.65rem] text-[var(--lx-muted)]">
        +10 points per lesson, +1 per correct quiz answer. Missing a day
        resets the streak to 1.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[var(--lx-border)] bg-[var(--lx-bg-elevated)]/40 px-2 py-2">
      <div className="font-mono text-base font-semibold text-[var(--lx-fg)]">
        {value}
      </div>
      <div className="text-[0.6rem] uppercase tracking-wider text-[var(--lx-muted)]">
        {label}
      </div>
    </div>
  );
}
