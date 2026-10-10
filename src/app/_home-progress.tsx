'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  AwardIcon,
  FireIcon,
  PlayIcon,
  StarIcon,
  TrophyIcon,
} from '@/components/ui/Icon';
import { Pill, ProgressBar } from '@/components/ui/Pill';
import { findNextLesson } from '@/lib/next-lesson';
import { useProgress } from '@/lib/progress-context';
import { TRACK_LABEL } from '@/lib/lesson-tracks';
import type { LessonTrack } from '@/lib/types';

/**
 * Client-side, progress-aware pieces of the home page. Each renders the
 * first-visit version on the server and before the progress store has
 * hydrated, so the static HTML matches the first client render.
 */

export interface HomeLesson {
  id: string;
  slug: string;
  title: string;
  order: number;
  track: LessonTrack;
}

function useHomeProgress(lessons: HomeLesson[]) {
  const { state, ready, completedSet } = useProgress();
  const returning = ready && (state.completed.length > 0 || Object.keys(state.quiz).length > 0);
  const next = ready ? findNextLesson(lessons, completedSet) : null;
  const allDone = ready && lessons.length > 0 && lessons.every((l) => completedSet.has(l.id));
  return { state, returning, next, allDone };
}

/** The hero's primary button: start, or continue with the next lesson. */
export function HeroCta({ lessons }: { lessons: HomeLesson[] }) {
  const { next } = useHomeProgress(lessons);
  if (next) {
    return (
      <Link href={`/lessons/${next.slug}`} className="lx-btn lx-btn-primary w-full px-5 py-3 sm:w-auto">
        <PlayIcon size={14} /> Continue:
        <span className="max-w-[18ch] truncate font-semibold">{next.title}</span>
      </Link>
    );
  }
  return (
    <Link href="/lessons" className="lx-btn lx-btn-primary w-full px-5 py-3 sm:w-auto">
      Start learning <ArrowRightIcon size={16} />
    </Link>
  );
}

/** "Welcome back" summary, shown only once the visitor has made progress. */
export function ReturningPanel({ lessons }: { lessons: HomeLesson[] }) {
  const { state, returning } = useHomeProgress(lessons);
  if (!returning) return null;
  const { current, points } = state.streak;
  return (
    <section
      aria-label="Your progress"
      className="lx-card grid animate-lx-rise-in gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
    >
      <div className="space-y-3">
        <p className="lx-eyebrow">Welcome back</p>
        <ProgressBar value={state.completed.length} max={lessons.length} label="Lessons completed" />
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-lx-muted">
          <li className="inline-flex items-center gap-1.5">
            <FireIcon size={14} className="text-lx-warning" />
            <span className="font-semibold text-lx-fg">{current}</span> day streak
          </li>
          <li className="inline-flex items-center gap-1.5">
            <StarIcon size={14} className="text-lx-accent" />
            <span className="font-semibold text-lx-fg">{points}</span> points
          </li>
          <li className="inline-flex items-center gap-1.5">
            <AwardIcon size={14} className="text-lx-accent-2" />
            <span className="font-semibold text-lx-fg">{state.achievements.length}</span> badges
          </li>
        </ul>
      </div>
      <Link href="/profile" className="lx-btn lx-btn-secondary self-start md:self-auto">
        Your profile <ArrowRightIcon size={14} />
      </Link>
    </section>
  );
}

/** Closing call to action: first lesson, next lesson, or on to the bosses. */
export function HomeCtaCard({ lessons }: { lessons: HomeLesson[] }) {
  const { returning, next, allDone } = useHomeProgress(lessons);
  const first = lessons[0];

  let tone: 'success' | 'accent' = 'success';
  let eyebrow = 'Ready when you are';
  let title = 'Open the first lesson';
  let body = 'A five-minute warm-up. All you need is a keyboard.';
  let href = first ? `/lessons/${first.slug}` : '/lessons';
  let label = 'Open the first lesson';

  if (allDone) {
    tone = 'accent';
    eyebrow = 'Catalogue complete';
    title = 'Every lesson done. Time for a boss.';
    body = 'Boss levels chain several commands into one real-world fix.';
    href = '/boss';
    label = 'Take on a boss';
  } else if (returning && next) {
    eyebrow = 'Up next';
    title = next.title;
    body = `Continue the ${TRACK_LABEL[next.track]} track where you left off.`;
    href = `/lessons/${next.slug}`;
    label = 'Continue learning';
  }

  return (
    <div className="lx-card flex flex-col justify-between gap-5 p-6 sm:p-8">
      <div>
        <Pill tone={tone}>
          {allDone && <TrophyIcon size={11} />} {eyebrow}
        </Pill>
        <h2 className="mt-3 text-xl font-semibold sm:text-2xl">{title}</h2>
        <p className="mt-2 text-sm text-lx-muted">{body}</p>
      </div>
      <Link href={href} className="lx-btn lx-btn-primary self-start">
        {label} <ArrowRightIcon size={14} />
      </Link>
    </div>
  );
}
