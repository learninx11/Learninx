'use client';

import Link from 'next/link';
import { ArrowRightIcon, CheckIcon, ChevronRightIcon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { useProgress } from '@/lib/progress-context';
import type { Lesson } from '@/lib/types';

interface Props {
  lessons: Lesson[];
}

/**
 * Tiny recap row shown on the home page once the visitor has
 * finished at least one lesson. Renders nothing on first visits and
 * nothing until the progress store has hydrated — that keeps the
 * static prerender identical to the first client render.
 *
 * Shows the 3 most recently completed lessons (by lesson `order`,
 * which roughly tracks curriculum progress). Each chip is a link back
 * into the lesson so a returning user is one click away from
 * continuing.
 */
export function ContinueRow({ lessons }: Props) {
  const { state, ready } = useProgress();

  if (!ready || state.completed.length === 0) {
    return null;
  }

  // Sort by lesson order so the recap shows curriculum order rather
  // than arbitrary completion order — feels less random to users.
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const recent = state.completed
    .map((id) => byId.get(id))
    .filter((l): l is Lesson => Boolean(l))
    .sort((a, b) => a.order - b.order)
    .slice(-3)
    .reverse();

  if (recent.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--lx-muted)]">
        <CheckIcon size={12} />
        Pick up where you left off
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {recent.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.slug}`}
            className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--lx-border)] bg-[var(--lx-bg-elevated)]/60 px-3 py-1 text-xs text-[var(--lx-fg)] transition hover:border-[var(--lx-accent)] hover:text-[var(--lx-accent)]"
            aria-label={`Resume ${lesson.title}`}
          >
            <Pill
              tone={lesson.difficulty}
              className="!px-1.5 !py-0 !text-[0.6rem]"
            >
              {lesson.difficulty}
            </Pill>
            <span className="max-w-[16ch] truncate">{lesson.title}</span>
            <ChevronRightIcon
              size={12}
              className="opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100"
            />
          </Link>
        ))}
      </div>
      <Link
        href="/lessons"
        className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--lx-muted)] hover:text-[var(--lx-accent)]"
      >
        See all lessons <ArrowRightIcon size={12} />
      </Link>
    </div>
  );
}
