'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRightIcon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/Pill';
import { StreakWidget } from '@/components/StreakWidget';
import { TrackIcon } from '@/components/TrackIcon';
import { useProgress } from '@/lib/progress-context';
import { TRACK_DESCRIPTION, TRACK_LABEL, TRACK_ORDER } from '@/lib/lesson-tracks';
import type { Lesson } from '@/lib/types';

/** The `/lessons` landing page: overall progress plus a card per track — no mixed lesson list here, each track lives on its own page. */
export function LessonsHubClient({ lessons }: { lessons: Lesson[] }) {
  const { completedSet, state, ready } = useProgress();

  const completed = useMemo(() => lessons.filter((l) => completedSet.has(l.id)).length, [lessons, completedSet]);
  const quizAttempts = Object.keys(state.quiz).length;
  const displayCompleted = ready ? completed : 0;
  const displayQuizCount = ready ? quizAttempts : 0;

  const byTrack = useMemo(() => {
    return TRACK_ORDER.map((track) => {
      const items = lessons.filter((l) => l.track === track);
      const done = items.filter((l) => completedSet.has(l.id)).length;
      return { track, total: items.length, completed: ready ? done : 0 };
    });
  }, [lessons, completedSet, ready]);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Lessons</h1>
        <p className="max-w-2xl text-[var(--lx-muted)]">
          Pick a track above. Linux fundamentals first, then a full DevOps
          curriculum - Git, CI/CD &amp; Jenkins, Infrastructure as Code, Cloud,
          Observability, and Containers &amp; Kubernetes. Each lesson ends
          with a small challenge, and your progress is saved on this browser.
        </p>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <ProgressBar value={displayCompleted} max={lessons.length} label="Overall progress" />
          <div className="text-sm text-[var(--lx-muted)] sm:text-right">
            <div className="font-mono text-base text-[var(--lx-fg)]">
              {displayCompleted}
              <span className="text-[var(--lx-muted)]"> / {lessons.length}</span>
            </div>
            <div className="text-xs text-[var(--lx-muted)]">
              {displayQuizCount} quiz attempt
              {displayQuizCount === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        <StreakWidget variant="inline" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {byTrack.map(({ track, total, completed: trackCompleted }) => (
          <Link
            key={track}
            href={`/lessons/track/${track}`}
            className="lx-card lx-card-interactive group flex flex-col gap-3 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-lg font-bold text-[var(--lx-fg)]">
                <TrackIcon track={track} size={18} />
                {TRACK_LABEL[track]}
              </span>
              <ArrowRightIcon
                size={18}
                className="shrink-0 text-[var(--lx-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--lx-accent)]"
              />
            </div>
            <p className="text-sm text-[var(--lx-muted)]">{TRACK_DESCRIPTION[track]}</p>
            <ProgressBar
              value={trackCompleted}
              max={total}
              label={`${total} lesson${total === 1 ? '' : 's'}`}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
