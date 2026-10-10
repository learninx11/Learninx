'use client';

import Link from 'next/link';
import { ArrowRightIcon, CheckIcon, TargetIcon, TerminalIcon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { RichText } from '@/components/ui/RichText';
import { useProgress } from '@/lib/progress-context';
import { getAllBosses } from '@/lib/bosses';

/** The boss-level grid, aware of which bosses this browser has already cleared. */
export function BossIndexClient() {
  // `BossLevel` carries functions (`seedVfs`, each step's `verify`), which
  // can't cross the server -> client boundary as props — look the
  // catalogue up here instead, the same way `BossClient` does for a
  // single boss. It's a pure function over the in-code catalogue, so it
  // works identically in a client component.
  const bosses = getAllBosses();
  const { state, ready } = useProgress();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Pill tone="accent">
          <TargetIcon size={12} /> ~/boss-levels
        </Pill>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Boss levels
        </h1>
        <p className="max-w-2xl text-[var(--lx-muted)]">
          Multi-step challenges for learners who have finished the regular
          catalogue. Each boss is a scenario: read what is wrong, plan your
          moves, and type the right commands. You can use the in-browser
          terminal below each step.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {bosses.map((b) => {
          const completed = ready && state.bossesCompleted.includes(b.id);
          return (
            <Link
              key={b.id}
              href={`/boss/${b.slug}`}
              className="lx-card lx-card-interactive group flex flex-col gap-3 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${
                    completed
                      ? 'border-lx-success/40 bg-lx-success/10 text-lx-success'
                      : 'border-lx-border bg-lx-surface text-lx-accent'
                  }`}
                  aria-hidden
                >
                  {completed ? <CheckIcon size={18} /> : <TerminalIcon size={18} />}
                </span>
                <div className="flex items-center gap-1.5">
                  {completed && (
                    <Pill tone="success">
                      <CheckIcon size={10} /> Completed
                    </Pill>
                  )}
                  <Pill tone={b.difficulty}>{b.difficulty}</Pill>
                </div>
              </div>
              <h2 className="text-xl font-semibold transition group-hover:text-lx-accent">{b.title}</h2>
              <p className="text-sm text-lx-muted">
                <RichText text={b.description} />
              </p>
              <div className="mt-auto flex items-center justify-between text-xs text-[var(--lx-muted)]">
                <span>
                  {b.steps.length} step{b.steps.length === 1 ? '' : 's'}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-lx-accent">
                  {completed ? 'Replay' : 'Start'} <ArrowRightIcon size={12} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
