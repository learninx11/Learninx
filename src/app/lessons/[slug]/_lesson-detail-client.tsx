'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { ChallengeRunner } from '@/components/ChallengeRunner';
import { CompleteButton } from '@/components/CompleteButton';
import { LessonQuiz } from '@/components/LessonQuiz';
import { Markdown } from '@/components/Markdown';
import { useProgress } from '@/lib/progress-context';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { Pill } from '@/components/ui/Pill';
import { RichText } from '@/components/ui/RichText';
import { TableOfContents } from '@/components/TableOfContents';
import { extractToc } from '@/lib/toc';
import { setLessonNeighbours } from '@/lib/lesson-nav';
import { BookmarkButton } from '@/components/BookmarkButton';
import { LessonNoteEditor } from '@/components/LessonNoteEditor';
import { ShareButton } from '@/components/ShareButton';
import {
  ArrowRightIcon,
  BoltIcon,
  BrainIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  SparklesIcon,
} from '@/components/ui/Icon';
import { TrackIcon } from '@/components/TrackIcon';
import { TRACK_LABEL, TRACK_SHORT_LABEL } from '@/lib/lesson-tracks';
import type { Lesson, LessonTrack, QuizQuestion } from '@/lib/types';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

interface Neighbour {
  slug: string;
  title: string;
  track: LessonTrack;
}

interface Props {
  lesson: Lesson;
  /** Previous / next lesson in catalogue order, for the footer links and `[` / `]`. */
  neighbours: { previous: Neighbour | null; next: Neighbour | null };
  /** 0-based position of the lesson within its own track. */
  trackPosition: { index: number; total: number };
  questions: QuizQuestion[];
}

export function LessonDetailClient({ lesson, neighbours, trackPosition, questions }: Props) {
  const { isCompleted, state } = useProgress();
  const completed = isCompleted(lesson.id);
  const quizScore = state.quiz[lesson.id];
  const readingMinutes = Math.max(1, Math.round(lesson.content.length / 1100));
  const toc = useMemo(() => extractToc(lesson.content), [lesson.content]);
  const hasToc = toc.length >= 2;
  const { previous, next } = neighbours;

  // Publish this lesson's prev/next neighbours so the global
  // `KeyboardShortcuts` component can route `[` / `]` to them.
  useEffect(() => {
    setLessonNeighbours({
      previous: previous ? { slug: previous.slug } : null,
      next: next ? { slug: next.slug } : null,
    });
    return () => setLessonNeighbours(null);
  }, [previous, next]);

  const nextIsNewTrack = next !== null && next.track !== lesson.track;

  return (
    <>
      <ScrollProgress />
      <div className={`grid gap-8 ${hasToc ? 'xl:grid-cols-[13rem_minmax(0,1fr)]' : ''}`}>
        {hasToc && <TableOfContents entries={toc} variant="rail" />}

        <article className="min-w-0 space-y-8">
          <header className="space-y-4">
            <nav aria-label="Breadcrumb" className="text-sm text-lx-subtle">
              <ol className="flex flex-wrap items-center gap-1">
                <li>
                  <Link href="/lessons" className="transition hover:text-lx-accent">
                    Lessons
                  </Link>
                </li>
                <li aria-hidden>
                  <ChevronRightIcon size={13} />
                </li>
                <li>
                  <Link
                    href={`/lessons/track/${lesson.track}`}
                    className="transition hover:text-lx-accent"
                  >
                    {TRACK_LABEL[lesson.track]}
                  </Link>
                </li>
              </ol>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={lesson.difficulty}>{DIFFICULTY_LABEL[lesson.difficulty]}</Pill>
              <Pill tone="default">
                <TrackIcon track={lesson.track} size={10} /> {TRACK_SHORT_LABEL[lesson.track]}
              </Pill>
              {completed && (
                <Pill tone="success">
                  <CheckIcon size={10} /> Completed
                </Pill>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs text-lx-subtle">
                Lesson {trackPosition.index + 1} of {trackPosition.total}
                <span aria-hidden>·</span>
                <ClockIcon size={12} /> {readingMinutes} min read
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-lx-muted">
              <RichText text={lesson.description} />
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <BookmarkButton lessonId={lesson.id} />
              <ShareButton path={`/lessons/${lesson.slug}`} title={lesson.title} />
              {lesson.challenge && (
                <a href="#challenge" className="lx-btn lx-btn-ghost lx-btn-sm text-lx-muted">
                  <BoltIcon size={14} /> Skip to the challenge
                </a>
              )}
            </div>
          </header>

          <TableOfContents entries={toc} variant="inline" />

          <Markdown content={lesson.content} />

          {lesson.challenge && (
            <section
              id="challenge"
              aria-labelledby="challenge-heading"
              className="lx-card scroll-mt-24 p-5 sm:p-6"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 id="challenge-heading">
                  <Pill tone="accent">
                    <BoltIcon size={12} /> Challenge
                  </Pill>
                </h2>
                {completed && (
                  <Pill tone="success">
                    <CheckIcon size={10} /> Solved
                  </Pill>
                )}
              </div>
              <p className="mb-4 text-lx-fg">
                <RichText text={lesson.challenge} />
              </p>
              <ChallengeRunner lessonId={lesson.id} lessonSolution={lesson.solution} />
            </section>
          )}

          {questions.length > 0 && (
            <section id="quiz" aria-labelledby="quiz-heading" className="lx-card scroll-mt-24 p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 id="quiz-heading">
                  <Pill tone="accent">
                    <BrainIcon size={12} /> Quiz
                  </Pill>
                </h2>
                {quizScore && (
                  <span className="text-xs text-lx-subtle">
                    Last attempt: {quizScore.score}% ({quizScore.correct}/{quizScore.total})
                  </span>
                )}
              </div>
              <p className="mb-5 text-sm text-lx-muted">
                Lock in the concepts. Score at least 80% to mark the lesson complete.
              </p>
              <LessonQuiz
                lessonId={lesson.id}
                questions={questions.map((q) => ({
                  id: q.id,
                  prompt: q.prompt,
                  answer: q.answer,
                }))}
                previousScore={quizScore?.score ?? null}
              />
            </section>
          )}

          {!completed && (
            <div className="flex flex-col items-start justify-between gap-3 rounded-[var(--radius-lx)] border border-dashed border-lx-border-strong p-4 sm:flex-row sm:items-center sm:p-5">
              <div>
                <h2 className="font-semibold">Done with this one?</h2>
                <p className="text-sm text-lx-muted">
                  Skipped the challenge? You can mark the lesson complete by hand.
                </p>
              </div>
              <CompleteButton lessonId={lesson.id} />
            </div>
          )}

          {completed && next && (
            <div className="lx-pulse-success lx-card flex flex-col items-start justify-between gap-4 border-lx-success/30 p-5 sm:flex-row sm:items-center">
              <div>
                <Pill tone="success">
                  <CheckIcon size={10} /> Lesson complete
                </Pill>
                <h2 className="mt-2 font-semibold">
                  {nextIsNewTrack
                    ? `That's the end of ${TRACK_LABEL[lesson.track]}!`
                    : 'Nice work — on to the next one.'}
                </h2>
                <p className="text-sm text-lx-muted">
                  {nextIsNewTrack ? `Next track: ${TRACK_LABEL[next.track]} — ` : 'Up next: '}“
                  {next.title}”.
                </p>
              </div>
              <Link href={`/lessons/${next.slug}`} className="lx-btn lx-btn-primary shrink-0">
                Next lesson <ArrowRightIcon size={14} />
              </Link>
            </div>
          )}

          <LessonNoteEditor lessonId={lesson.id} />

          <nav aria-label="Lesson navigation" className="grid gap-3 border-t border-lx-border pt-6 sm:grid-cols-2">
            {previous ? (
              <Link
                href={`/lessons/${previous.slug}`}
                className="lx-card lx-card-interactive group flex flex-col gap-1 p-4"
              >
                <span className="flex items-center gap-1.5 text-xs text-lx-subtle">
                  <ChevronLeftIcon size={13} /> Previous
                  <kbd className="lx-kbd ml-auto hidden sm:inline-flex" aria-hidden>
                    [
                  </kbd>
                </span>
                <span className="font-medium text-lx-fg group-hover:text-lx-accent">{previous.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next ? (
              <Link
                href={`/lessons/${next.slug}`}
                className="lx-card lx-card-interactive group flex flex-col items-end gap-1 p-4 text-right"
              >
                <span className="flex w-full items-center gap-1.5 text-xs text-lx-subtle">
                  <kbd className="lx-kbd hidden sm:inline-flex" aria-hidden>
                    ]
                  </kbd>
                  <span className="ml-auto inline-flex items-center gap-1.5">
                    Next
                    {nextIsNewTrack && <span>· {TRACK_SHORT_LABEL[next.track]}</span>}
                    <ChevronRightIcon size={13} />
                  </span>
                </span>
                <span className="font-medium text-lx-fg group-hover:text-lx-accent">{next.title}</span>
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lx)] border border-lx-accent/30 bg-lx-accent/10 p-4 text-sm font-medium text-lx-accent">
                <SparklesIcon size={14} /> You’ve reached the end of the catalogue!
              </span>
            )}
          </nav>
        </article>

      </div>

    </>
  );
}
