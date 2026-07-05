'use client';

import { ProgressBar } from '@/components/ui/Pill';
import { useProgress } from '@/lib/progress-context';

/**
 * Client-side progress widgets for the home page. Lives in a separate
 * file so the static `page.tsx` can stay a server component (and
 * therefore be prerendered for the static export).
 */
export function HomeProgress({ totalLessons }: { totalLessons: number }) {
  const { state, ready } = useProgress();
  const completedCount = state.completed.length;
  const isFirstVisit =
    completedCount === 0 && Object.keys(state.quiz).length === 0;

  // Render the bar in its "empty" state on the server / before
  // hydration so we don't flash a personalised number on a static
  // page.
  const value = ready ? completedCount : 0;
  const label = ready
    ? isFirstVisit
      ? 'Begin your journey'
      : 'Lessons completed'
    : 'Loading progress…';

  return <ProgressBar value={value} max={totalLessons} label={label} />;
}

export function HomeCtaText({ totalLessons }: { totalLessons: number }) {
  const { state, ready } = useProgress();
  if (!ready) {
    return (
      <>
        <h2 className="mt-3 text-xl font-semibold sm:text-2xl">
          Open the first lesson
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          A 5-minute warm-up. You only need a keyboard.
        </p>
      </>
    );
  }
  const completedCount = state.completed.length;
  const quizAttempts = Object.keys(state.quiz).length;
  const isFirstVisit = completedCount === 0 && quizAttempts === 0;
  return (
    <>
      <h2 className="mt-3 text-xl font-semibold sm:text-2xl">
        {isFirstVisit ? 'Open the first lesson' : 'Pick up where you left off'}
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        {isFirstVisit
          ? 'A 5-minute warm-up. You only need a keyboard.'
          : `You've completed ${completedCount} of ${totalLessons} lessons. ${quizAttempts} quiz attempt${quizAttempts === 1 ? '' : 's'} so far.`}
      </p>
    </>
  );
}

export function HomeCtaButton({ totalLessons: _totalLessons }: { totalLessons: number }) {
  const { state, ready } = useProgress();
  const completedCount = state.completed.length;
  const quizAttempts = Object.keys(state.quiz).length;
  const isFirstVisit = completedCount === 0 && quizAttempts === 0;
  if (!ready || isFirstVisit) {
    return <>Open the first lesson</>;
  }
  return <>Continue learning</>;
}
