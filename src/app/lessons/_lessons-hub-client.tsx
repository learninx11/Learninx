'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRightIcon, BookmarkIcon, CheckIcon, PlayIcon } from '@/components/ui/Icon';
import { Pill, ProgressBar } from '@/components/ui/Pill';
import { StreakWidget } from '@/components/StreakWidget';
import { TrackIcon } from '@/components/TrackIcon';
import { findNextLesson } from '@/lib/next-lesson';
import { useProgress } from '@/lib/progress-context';
import { TRACK_DESCRIPTION, TRACK_LABEL, TRACK_ORDER } from '@/lib/lesson-tracks';
import type { LessonSummary } from '@/lib/types';

/** The `/lessons` landing page: overall progress plus a card per track — no mixed lesson list here, each track lives on its own page. */
export function LessonsHubClient({ lessons }: { lessons: LessonSummary[] }) {
  const { completedSet, state, ready } = useProgress();

  const completed = useMemo(() => lessons.filter((l) => completedSet.has(l.id)).length, [lessons, completedSet]);
  const quizAttempts = Object.keys(state.quiz).length;
  const displayCompleted = ready ? completed : 0;
  const displayQuizCount = ready ? quizAttempts : 0;
  const next = ready ? findNextLesson(lessons, completedSet) : null;

  const saved = useMemo(
    () => (ready ? lessons.filter((l) => state.bookmarks.includes(l.id)) : []),
    [lessons, state.bookmarks, ready],
  );

  const byTrack = useMemo(() => {
    return TRACK_ORDER.map((track) => {
      const items = lessons.filter((l) => l.track === track);
      const done = items.filter((l) => completedSet.has(l.id)).length;
      return { track, total: items.length, completed: ready ? done : 0 };
    });
  }, [lessons, completedSet, ready]);

  return (
    <div className="space-y-10">
      <header className="space-y-5">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Lessons</h1>
          <p className="max-w-2xl text-lx-muted">
            Start with Linux fundamentals, then work through a full DevOps curriculum —
            Git, CI/CD, Infrastructure as Code, Cloud, Security, Observability, SRE, and
            Kubernetes. Every lesson ends with a hands-on challenge and a short quiz.
          </p>
        </div>

        <div className="lx-card space-y-3 p-5">
          <ProgressBar value={displayCompleted} max={lessons.length} label="Overall progress" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StreakWidget variant="inline" />
            <span className="text-xs text-lx-subtle">
              {displayQuizCount} quiz attempt{displayQuizCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </header>

      {next && (
        <Link
          href={`/lessons/${next.slug}`}
          className="lx-card lx-card-interactive group flex animate-lx-rise-in items-center gap-4 border-lx-accent/30 p-4 sm:p-5"
        >
          <span
            aria-hidden
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lx-accent text-lx-accent-contrast"
          >
            <PlayIcon size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="lx-eyebrow block">Continue where you left off</span>
            <span className="mt-0.5 block truncate font-semibold text-lx-fg">{next.title}</span>
            <span className="block truncate text-xs text-lx-muted">{TRACK_LABEL[next.track]}</span>
          </span>
          <ArrowRightIcon
            size={18}
            className="shrink-0 text-lx-accent transition-transform group-hover:translate-x-1"
          />
        </Link>
      )}

      {saved.length > 0 && (
        <section id="bookmarks" aria-labelledby="saved-heading" className="scroll-mt-24 space-y-3">
          <h2 id="saved-heading" className="inline-flex items-center gap-2 text-lg font-semibold">
            <BookmarkIcon size={16} className="text-lx-accent" fill="currentColor" /> Saved lessons
            <span className="text-sm font-normal text-lx-subtle">{saved.length}</span>
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {saved.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/lessons/${l.slug}`}
                  className="lx-card lx-card-interactive flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 text-lx-muted">
                      <TrackIcon track={l.track} size={14} />
                    </span>
                    <span className="truncate">{l.title}</span>
                  </span>
                  {completedSet.has(l.id) ? (
                    <span className="inline-flex shrink-0 items-center text-lx-success">
                      <CheckIcon size={14} />
                      <span className="sr-only">Completed</span>
                    </span>
                  ) : (
                    <ArrowRightIcon size={14} className="shrink-0 text-lx-subtle" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="tracks-heading" className="space-y-4">
        <h2 id="tracks-heading" className="text-lg font-semibold">
          Tracks
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {byTrack.map(({ track, total, completed: trackCompleted }) => {
            const done = total > 0 && trackCompleted === total;
            const started = trackCompleted > 0;
            return (
              <Link
                key={track}
                href={`/lessons/track/${track}`}
                className="lx-card lx-card-interactive group flex flex-col gap-3 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      done
                        ? 'border-lx-success/40 bg-lx-success/10 text-lx-success'
                        : 'border-lx-border bg-lx-surface text-lx-accent'
                    }`}
                  >
                    <TrackIcon track={track} size={18} />
                  </span>
                  {done ? (
                    <Pill tone="success">
                      <CheckIcon size={10} /> Complete
                    </Pill>
                  ) : started ? (
                    <Pill tone="accent">In progress</Pill>
                  ) : null}
                </div>
                <div>
                  <h3 className="font-semibold text-lx-fg transition group-hover:text-lx-accent">
                    {TRACK_LABEL[track]}
                  </h3>
                  <p className="mt-1 line-clamp-3 text-sm text-lx-muted">{TRACK_DESCRIPTION[track]}</p>
                </div>
                <ProgressBar
                  className="mt-auto pt-1"
                  value={trackCompleted}
                  max={total}
                  label={`${total} lesson${total === 1 ? '' : 's'}`}
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
