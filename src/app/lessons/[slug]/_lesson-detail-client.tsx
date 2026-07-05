'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ChallengeRunner } from '@/components/ChallengeRunner';
import { CompleteButton } from '@/components/CompleteButton';
import { LessonQuiz } from '@/components/LessonQuiz';
import { Markdown } from '@/components/Markdown';
import { useProgress } from '@/lib/progress-context';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { TerminalClient as Terminal } from '@/components/TerminalClient';
import { Pill, ProgressBar } from '@/components/ui/Pill';
import {
  ArrowRightIcon,
  BoltIcon,
  BrainIcon,
  CheckIcon,
  ChevronLeftIcon,
  SparklesIcon,
  TerminalIcon,
} from '@/components/ui/Icon';
import type { Lesson, QuizQuestion } from '@/lib/types';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

interface Props {
  lesson: Lesson;
  /** Same lesson in the catalogue, used for next/previous links. */
  neighbours: { previous: Lesson | null; next: Lesson | null };
  /** 0-based index of the lesson in the catalogue. */
  position: { index: number; total: number };
  questions: QuizQuestion[];
}

export function LessonDetailClient({ lesson, neighbours, position, questions }: Props) {
  const { isCompleted, state } = useProgress();
  const completed = isCompleted(lesson.id);
  const quizScore = state.quiz[lesson.id];
  const readingMinutes = Math.max(1, Math.round(lesson.content.length / 1100));
  const sandboxRef = useRef<HTMLDivElement | null>(null);

  // Keyboard shortcut: pressing "t" focuses the sandbox so the learner
  // can type into the terminal without reaching for the mouse.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 't' && !event.metaKey && !event.ctrlKey) {
        const target = event.target as HTMLElement | null;
        if (target && /^(INPUT|TEXTAREA|SELECT)$/i.test(target.tagName)) return;
        const term = sandboxRef.current?.querySelector<HTMLElement>(
          '[data-xterm] textarea, .xterm-helper-textarea',
        );
        term?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <ScrollProgress />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] xl:gap-8">
        <article className="min-w-0 space-y-6">
          <header className="space-y-3">
            <Link
              href="/lessons"
              className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-[var(--lx-accent)]"
            >
              <ChevronLeftIcon size={14} /> Back to lessons
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={lesson.difficulty}>
                {DIFFICULTY_LABEL[lesson.difficulty]}
              </Pill>
              {completed && (
                <Pill tone="success">
                  <CheckIcon size={10} /> Completed
                </Pill>
              )}
              <span className="text-xs text-slate-500">
                Lesson {position.index + 1} of {position.total} · {readingMinutes} min read
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="max-w-2xl text-slate-400">{lesson.description}</p>
          </header>

          <Markdown content={lesson.content} />

          {lesson.challenge && (
            <section id="challenge" className="lx-card scroll-mt-24 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <Pill tone="accent">
                  <BoltIcon size={12} /> Challenge
                </Pill>
              </div>
              <p className="mb-4 text-slate-200">{lesson.challenge}</p>
              <ChallengeRunner
                lessonId={lesson.id}
                lessonSlug={lesson.slug}
                lessonSolution={lesson.solution}
                initiallyCompleted={completed}
              />
              {lesson.solution && (
                <p className="mt-3 text-xs text-slate-500">
                  Tip: type the command in the sandbox on the right, or paste the
                  solution here. The sandbox runs in real time.
                </p>
              )}
            </section>
          )}

          {questions.length > 0 && (
            <section id="quiz" className="lx-card scroll-mt-24 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <Pill tone="accent">
                  <BrainIcon size={12} /> Quiz
                </Pill>
                {quizScore && (
                  <span className="text-xs text-slate-500">
                    Last attempt: {quizScore.score}% ({quizScore.correct}/
                    {quizScore.total})
                  </span>
                )}
              </div>
              <p className="mb-4 text-sm text-slate-400">
                Answer these to lock in the concepts. Score at least 80% to mark
                the lesson complete.
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
            <div className="lx-card flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
              <div>
                <h3 className="font-semibold">Mark as complete</h3>
                <p className="text-sm text-slate-400">
                  Skipped the challenge? You can mark this lesson done by hand.
                </p>
              </div>
              <CompleteButton lessonId={lesson.id} />
            </div>
          )}

          {completed && neighbours.next && (
            <div className="lx-pulse-success lx-card flex flex-col items-start justify-between gap-3 border-[var(--lx-success)]/30 p-4 sm:flex-row sm:items-center sm:p-5">
              <div>
                <div className="flex items-center gap-2">
                  <Pill tone="success">
                    <CheckIcon size={10} /> Completed
                  </Pill>
                </div>
                <h3 className="mt-2 font-semibold">Nice work — on to the next one.</h3>
                <p className="text-sm text-slate-400">
                  Continue the track with “{neighbours.next.title}”.
                </p>
              </div>
              <Link
                href={`/lessons/${neighbours.next.slug}`}
                className="lx-btn lx-btn-primary"
              >
                Next lesson <ArrowRightIcon size={14} />
              </Link>
            </div>
          )}

          <nav className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-between">
            {neighbours.previous ? (
              <Link
                href={`/lessons/${neighbours.previous.slug}`}
                className="lx-btn lx-btn-ghost text-slate-400"
              >
                <ChevronLeftIcon size={14} /> {neighbours.previous.title}
              </Link>
            ) : (
              <span />
            )}
            {neighbours.next ? (
              <Link
                href={`/lessons/${neighbours.next.slug}`}
                className="lx-btn lx-btn-secondary"
              >
                {neighbours.next.title} <ArrowRightIcon size={14} />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 self-end rounded-md border border-[var(--lx-accent)]/30 bg-[var(--lx-accent)]/10 px-3 py-1.5 text-sm text-[var(--lx-accent)]">
                <SparklesIcon size={14} /> You finished the track!
              </span>
            )}
          </nav>
        </article>

        <aside
          ref={sandboxRef}
          className="space-y-3 lg:sticky lg:top-20 lg:self-start"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <TerminalIcon size={14} /> Sandbox
            </div>
            <ProgressBar
              value={completed ? 1 : 0}
              max={1}
              label="Challenge"
            />
          </div>
          <div className="h-[60vh] min-h-[420px] lg:h-[calc(100vh-7rem)]">
            <Terminal
              className="h-full"
              suggestion={
                lesson.solution
                  ? {
                      command: lesson.trackCommand ?? lesson.solution,
                      expected: lesson.solution,
                    }
                  : lesson.trackCommand
                    ? { command: lesson.trackCommand, expected: lesson.trackCommand }
                    : undefined
              }
            />
          </div>
        </aside>
      </div>
    </>
  );
}
