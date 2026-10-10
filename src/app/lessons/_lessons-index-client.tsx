'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  SearchIcon,
  SparklesIcon,
} from '@/components/ui/Icon';
import { Pill, ProgressBar } from '@/components/ui/Pill';
import { RichText, plainText } from '@/components/ui/RichText';
import { StreakWidget } from '@/components/StreakWidget';
import { TrackIcon } from '@/components/TrackIcon';
import { useProgress } from '@/lib/progress-context';
import { TRACK_DESCRIPTION, TRACK_LABEL } from '@/lib/lesson-tracks';
import type { Difficulty, LessonSummary, LessonTrack } from '@/lib/types';

const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

type StatusFilter = 'all' | 'completed' | 'todo' | 'bookmarked';

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: 'Any status',
  todo: 'To do',
  completed: 'Completed',
  bookmarked: 'Saved',
};

/** The lesson listing for a single track — `lessons` arrives already filtered to `track`. */
export function LessonsIndexClient({ lessons, track }: { lessons: LessonSummary[]; track: LessonTrack }) {
  const { completedSet, state, ready } = useProgress();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Deep links: `?hl=grep` pre-fills the search, `?bookmarks=1` (or
  // `?status=completed|todo|bookmarked`) pre-selects a status chip, and
  // `?difficulty=beginner` pre-selects a difficulty. Read on mount
  // instead of via useSearchParams so the static export stays simple.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hl = params.get('hl') ?? params.get('q');
    if (hl) setQuery(hl);
    const st = params.get('status');
    if (params.get('bookmarks') === '1') setStatus('bookmarked');
    else if (st === 'completed' || st === 'todo' || st === 'bookmarked') setStatus(st);
    const diff = params.get('difficulty');
    if (diff && (DIFFICULTY_ORDER as string[]).includes(diff)) {
      setDifficulty(diff as Difficulty);
    }
  }, []);

  const router = useRouter();
  const lastSurpriseRef = useRef<string | null>(null);

  const lessonsWithStatus = useMemo(
    () =>
      lessons.map((l) => ({
        ...l,
        completed: completedSet.has(l.id),
        bookmarked: ready ? state.bookmarks.includes(l.id) : false,
      })),
    [lessons, completedSet, ready, state.bookmarks],
  );

  // `lesson.order` is a global sort key across every track, so it isn't a
  // clean 1-based position within just this track's list — number rows
  // within the filtered track itself instead.
  const lessonPosition = useMemo(() => {
    const map = new Map<string, number>();
    lessons.forEach((l, i) => map.set(l.id, i + 1));
    return map;
  }, [lessons]);

  // Difficulty chips only for levels this track actually has.
  const availableDifficulties = useMemo(
    () => DIFFICULTY_ORDER.filter((d) => lessons.some((l) => l.difficulty === d)),
    [lessons],
  );

  // Pick a random lesson in this track, preferring ones the user hasn't
  // completed yet. Avoids repeating the same slug twice in a row.
  const surprise = useCallback(() => {
    if (lessonsWithStatus.length === 0) return;
    const todo = lessonsWithStatus.filter((l) => !l.completed);
    const pool = todo.length > 0 ? todo : lessonsWithStatus;
    const candidates =
      pool.length > 1 && lastSurpriseRef.current
        ? pool.filter((l) => l.slug !== lastSurpriseRef.current)
        : pool;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (!pick) return;
    lastSurpriseRef.current = pick.slug;
    router.push(`/lessons/${pick.slug}`);
  }, [lessonsWithStatus, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessonsWithStatus.filter((l) => {
      if (difficulty !== 'all' && l.difficulty !== difficulty) return false;
      if (status === 'completed' && !l.completed) return false;
      if (status === 'todo' && l.completed) return false;
      if (status === 'bookmarked' && !l.bookmarked) return false;
      if (q) {
        const haystack = [
          l.title,
          l.description,
          l.id,
          l.slug,
          l.trackCommand ?? '',
          l.difficulty,
          l.excerpt ?? '',
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
        items: filtered.filter((l) => l.difficulty === d).sort((a, b) => a.order - b.order),
      })).filter((g) => g.items.length > 0),
    [filtered],
  );

  const completed = lessonsWithStatus.filter((l) => l.completed).length;

  // Pre-hydration: show zero progress so the static HTML matches the
  // first client render and React doesn't warn about mismatches.
  const displayCompleted = ready ? completed : 0;
  const filtering = query !== '' || difficulty !== 'all' || status !== 'all';

  function resetFilters() {
    setQuery('');
    setDifficulty('all');
    setStatus('all');
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <nav aria-label="Breadcrumb" className="text-sm text-lx-subtle">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/lessons" className="transition hover:text-lx-accent">
                Lessons
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRightIcon size={13} />
            </li>
            <li aria-current="page" className="text-lx-muted">
              {TRACK_LABEL[track]}
            </li>
          </ol>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span
              aria-hidden
              className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-lx-border bg-lx-surface text-lx-accent sm:inline-flex"
            >
              <TrackIcon track={track} size={22} />
            </span>
            <div className="min-w-0 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{TRACK_LABEL[track]}</h1>
              <p className="max-w-2xl text-lx-muted">{TRACK_DESCRIPTION[track]}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={surprise}
            disabled={lessons.length === 0}
            className="lx-btn lx-btn-secondary lx-btn-sm"
            title="Open a random lesson you haven't finished"
          >
            <SparklesIcon size={13} /> Surprise me
          </button>
        </div>

        <div className="max-w-xl space-y-3">
          <ProgressBar value={displayCompleted} max={lessons.length} label="Track progress" />
          <StreakWidget variant="inline" />
        </div>
      </header>

      <section aria-label="Filter lessons" className="lx-card space-y-3 p-4 sm:p-5">
        <div className="relative">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lx-subtle"
            aria-hidden
          >
            <SearchIcon size={16} />
          </span>
          <input
            ref={inputRef}
            type="search"
            data-lx-page-search
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && query) {
                e.preventDefault();
                setQuery('');
              }
            }}
            placeholder={`Search ${TRACK_LABEL[track]} lessons`}
            className="lx-input pl-9 pr-16 font-sans [&::-webkit-search-cancel-button]:hidden"
            aria-label="Search lessons in this track"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-lx-subtle transition hover:text-lx-fg"
            >
              <CloseIcon size={14} />
            </button>
          ) : (
            <kbd className="lx-kbd pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 sm:inline-flex">
              /
            </kbd>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ChipGroup label="Difficulty">
            <Chip label="All" active={difficulty === 'all'} onClick={() => setDifficulty('all')} />
            {availableDifficulties.map((d) => (
              <Chip
                key={d}
                label={DIFFICULTY_LABELS[d]}
                active={difficulty === d}
                onClick={() => setDifficulty(d)}
              />
            ))}
          </ChipGroup>
          <ChipGroup label="Status">
            {(['all', 'todo', 'completed', 'bookmarked'] as StatusFilter[]).map((s) => (
              <Chip key={s} label={STATUS_LABEL[s]} active={status === s} onClick={() => setStatus(s)} />
            ))}
          </ChipGroup>
        </div>
        {filtering && (
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-lx-subtle" aria-live="polite">
            Showing {filtered.length} of {lessons.length} lessons
            <button type="button" onClick={resetFilters} className="font-medium text-lx-accent hover:underline">
              Clear filters
            </button>
          </p>
        )}
      </section>

      {grouped.length === 0 ? (
        <div className="lx-card flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-sm text-lx-muted">No lessons match these filters.</p>
          <button type="button" onClick={resetFilters} className="lx-btn lx-btn-secondary lx-btn-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.difficulty} aria-label={DIFFICULTY_LABELS[group.difficulty]} className="space-y-3">
              <div className="flex items-center gap-3">
                <Pill tone={group.difficulty}>{DIFFICULTY_LABELS[group.difficulty]}</Pill>
                <span className="text-xs text-lx-subtle">
                  {group.items.filter((l) => l.completed).length} of {group.items.length} complete
                </span>
              </div>
              <ul className="space-y-2.5">
                {group.items.map((lesson) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    position={lessonPosition.get(lesson.id) ?? lesson.order}
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

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs text-lx-subtle">{label}</span>
      {children}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? 'border-lx-accent bg-lx-accent-glow text-lx-accent'
          : 'border-lx-border text-lx-muted hover:border-lx-accent/40 hover:text-lx-fg'
      }`}
    >
      {label}
    </button>
  );
}

function LessonRow({
  lesson,
  position,
  query,
}: {
  lesson: LessonSummary & { completed: boolean; bookmarked: boolean };
  position: number;
  query: string;
}) {
  return (
    <li>
      <Link
        href={`/lessons/${lesson.slug}`}
        className="lx-card lx-card-interactive group flex items-center gap-4 p-4 sm:p-5"
      >
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold transition ${
            lesson.completed
              ? 'border-lx-success/40 bg-lx-success/10 text-lx-success'
              : 'border-lx-border bg-lx-surface text-lx-muted group-hover:border-lx-accent/40 group-hover:text-lx-accent'
          }`}
        >
          {lesson.completed ? (
            <>
              <CheckIcon size={18} />
              <span className="sr-only">Completed:</span>
            </>
          ) : (
            <span aria-hidden>{position}</span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-lx-fg transition group-hover:text-lx-accent">
              <Highlighted text={lesson.title} query={query} />
            </h3>
            {lesson.bookmarked && (
              <Pill tone="accent">
                <BookmarkIcon size={10} fill="currentColor" /> Saved
              </Pill>
            )}
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-lx-muted">
            {query ? (
              <Highlighted text={plainText(lesson.description)} query={query} />
            ) : (
              <RichText text={lesson.description} />
            )}
          </p>
        </div>

        <ArrowRightIcon
          size={18}
          className="shrink-0 text-lx-subtle transition group-hover:translate-x-1 group-hover:text-lx-accent"
        />
      </Link>
    </li>
  );
}

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-lx-accent/25 px-0.5 text-lx-fg">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
