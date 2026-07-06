'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  CheckIcon,
  FilterIcon,
  SearchIcon,
  TerminalIcon,
} from '@/components/ui/Icon';
import { Pill, ProgressBar } from '@/components/ui/Pill';
import { StreakWidget } from '@/components/StreakWidget';
import { useProgress } from '@/lib/progress-context';
import type { Difficulty, Lesson } from '@/lib/types';

const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

type StatusFilter = 'all' | 'completed' | 'todo';

export function LessonsIndexClient({ lessons }: { lessons: Lesson[] }) {
  const { completedSet, state, ready } = useProgress();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Press "/" to focus the search box (skip when typing in another field).
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== '/') return;
      const target = event.target as HTMLElement | null;
      const inField =
        target &&
        (/^(INPUT|TEXTAREA|SELECT)$/i.test(target.tagName) ||
          target.isContentEditable);
      if (inField) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const lessonsWithStatus = useMemo(
    () =>
      lessons.map((l) => ({
        ...l,
        completed: completedSet.has(l.id),
      })),
    [lessons, completedSet],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessonsWithStatus.filter((l) => {
      if (difficulty !== 'all' && l.difficulty !== difficulty) return false;
      if (status === 'completed' && !l.completed) return false;
      if (status === 'todo' && l.completed) return false;
      if (q) {
        const haystack = [
          l.title,
          l.description,
          l.id,
          l.slug,
          l.trackCommand ?? '',
          l.difficulty,
          l.content.slice(0, 200),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [lessonsWithStatus, query, difficulty, status]);

  const grouped = useMemo(
    () =>
      DIFFICULTY_ORDER.map((d) => ({
        difficulty: d,
        items: filtered
          .filter((l) => l.difficulty === d)
          .sort((a, b) => a.order - b.order),
      })).filter((g) => g.items.length > 0),
    [filtered],
  );

  const completed = lessonsWithStatus.filter((l) => l.completed).length;
  const quizAttempts = Object.keys(state.quiz).length;

  // Pre-hydration: show zero progress so the static HTML matches the
  // first client render and React doesn't warn about mismatches.
  const displayCompleted = ready ? completed : 0;
  const displayQuizCount = ready ? quizAttempts : 0;
  const totalMatching = filtered.length;
  const showResultsHint = query || difficulty !== 'all' || status !== 'all';

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Pill tone="accent">
          <TerminalIcon size={12} /> ~/lessons
        </Pill>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Lessons
        </h1>
        <p className="max-w-2xl text-[var(--lx-muted)]">
          Work through the chapters in order. Each lesson ends with a small
          challenge. Your progress is saved on this browser.
        </p>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <ProgressBar
            value={displayCompleted}
            max={lessons.length}
            label="Overall progress"
          />
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

      <section className="lx-card flex flex-col gap-3 p-4 sm:p-5">
        <div className="relative">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lx-muted)]"
            aria-hidden
          >
            <SearchIcon size={16} />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons (press / )"
            className="lx-input pl-9"
            aria-label="Search lessons"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-[var(--lx-muted)]">
            <FilterIcon size={12} /> Difficulty
          </span>
          <Chip
            label="All"
            active={difficulty === 'all'}
            onClick={() => setDifficulty('all')}
          />
          {DIFFICULTY_ORDER.map((d) => (
            <Chip
              key={d}
              label={DIFFICULTY_LABELS[d]}
              active={difficulty === d}
              onClick={() => setDifficulty(d)}
            />
          ))}
          <span className="mx-2 hidden h-4 w-px bg-[var(--lx-border)] sm:inline" />
          <Chip
            label="All status"
            active={status === 'all'}
            onClick={() => setStatus('all')}
          />
          <Chip
            label="To do"
            active={status === 'todo'}
            onClick={() => setStatus('todo')}
          />
          <Chip
            label="Completed"
            active={status === 'completed'}
            onClick={() => setStatus('completed')}
          />
        </div>
        {showResultsHint && (
          <p className="text-xs text-[var(--lx-muted)]">
            Showing {totalMatching} of {lessons.length} lessons
            {query ? ` matching “${query}”` : ''}
            {difficulty !== 'all' ? ` in ${DIFFICULTY_LABELS[difficulty]}` : ''}
            {status !== 'all' ? ` · ${status === 'completed' ? 'completed' : 'to do'}` : ''}
            {' · '}
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDifficulty('all');
                setStatus('all');
              }}
              className="text-[var(--lx-accent)] hover:underline"
            >
              reset
            </button>
          </p>
        )}
      </section>

      {grouped.length === 0 ? (
        <div className="lx-card p-10 text-center text-sm text-[var(--lx-muted)]">
          No lessons match the current filter.
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map((group) => (
            <section key={group.difficulty} className="space-y-3">
              <div className="flex items-center gap-3">
                <Pill tone={group.difficulty}>
                  {DIFFICULTY_LABELS[group.difficulty]}
                </Pill>
                <span className="text-xs text-[var(--lx-muted)]">
                  {group.items.filter((l) => l.completed).length}/
                  {group.items.length} complete
                </span>
              </div>
              <ul className="space-y-3">
                {group.items.map((lesson) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    query={query.trim().toLowerCase()}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${
        active
          ? 'border-[var(--lx-accent)] bg-[var(--lx-accent-glow)] text-[var(--lx-accent)]'
          : 'border-[var(--lx-border)] text-[var(--lx-muted)] hover:border-[var(--lx-accent)]/40 hover:text-[var(--lx-accent)]'
      }`}
    >
      {label}
    </button>
  );
}

function LessonRow({
  lesson,
  query,
}: {
  lesson: Lesson & { completed: boolean };
  query: string;
}) {
  return (
    <li>
      <Link
        href={`/lessons/${lesson.slug}`}
        className="lx-card lx-card-interactive group flex items-center gap-4 p-4 sm:p-5"
        aria-label={`Open lesson: ${lesson.title}${lesson.completed ? ' (completed)' : ''}`}
      >
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-mono font-semibold transition ${
            lesson.completed
              ? 'border-[var(--lx-success)]/40 bg-[var(--lx-success)]/10 text-[var(--lx-success)]'
              : 'border-[var(--lx-border)] bg-slate-900/40 text-[var(--lx-muted)] group-hover:border-[var(--lx-accent)]/40 group-hover:text-[var(--lx-accent)]'
          }`}
          aria-hidden
        >
          {lesson.completed ? <CheckIcon size={18} /> : lesson.order}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-semibold text-[var(--lx-fg)]">
              <Highlighted text={lesson.title} query={query} />
            </h2>
            {lesson.completed && <Pill tone="success">Completed</Pill>}
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-[var(--lx-muted)]">
            <Highlighted text={lesson.description} query={query} />
          </p>
        </div>

        <ArrowRightIcon
          size={18}
          className="shrink-0 text-[var(--lx-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--lx-accent)]"
        />
      </Link>
    </li>
  );
}

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-[var(--lx-accent)]/30 px-0.5 text-[var(--lx-fg)]">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
