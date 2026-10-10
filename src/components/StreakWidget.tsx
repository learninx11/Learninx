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
        <Pill tone={visible.current > 0 ? 'warning' : 'default'}>
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

  const active = visible.current > 0;
  return (
    <div className="lx-card flex h-full flex-col p-5 sm:p-6">
      <Pill tone={active ? 'warning' : 'accent'} className="self-start">
        <FireIcon size={12} /> Streak
      </Pill>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={`font-mono text-5xl font-bold tabular-nums ${active ? 'text-lx-warning' : 'text-lx-accent'}`}
        >
          {visible.current}
        </span>
        <span className="text-sm text-lx-muted">day{visible.current === 1 ? '' : 's'} in a row</span>
      </div>
      <p className="mt-1 text-xs text-lx-subtle">
        {active
          ? `Best so far: ${visible.best} day${visible.best === 1 ? '' : 's'}. Come back tomorrow to keep it going.`
          : 'Finish a lesson today to start a streak.'}
      </p>
      <div className="mt-auto grid grid-cols-3 gap-2 pt-4 text-center">
        <Stat label="Points" value={visible.points} />
        <Stat label="Lessons" value={visible.totalCompletions} />
        <Stat label="Correct" value={visible.totalCorrect} />
      </div>
      <p className="mt-3 text-[0.7rem] leading-relaxed text-lx-subtle">
        +10 per lesson · +1 per correct quiz answer · +25 per boss
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-lx-border bg-lx-surface px-2 py-2.5">
      <div className="font-mono text-lg font-semibold tabular-nums text-lx-fg">{value}</div>
      <div className="text-[0.62rem] uppercase tracking-wider text-lx-subtle">{label}</div>
    </div>
  );
}
