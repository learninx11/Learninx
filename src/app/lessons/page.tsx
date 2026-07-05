import Link from 'next/link';
import { ArrowRightIcon, CheckIcon, TerminalIcon } from '@/components/ui/Icon';
import { Pill, ProgressBar } from '@/components/ui/Pill';
import { getAllLessons } from '@/lib/lessons';
import { getCompletedLessonIds, getProgress } from '@/lib/progress';
import type { Difficulty, Lesson } from '@/lib/types';

// Read per-visitor progress on every render.
export const dynamic = 'force-dynamic';

const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function LessonsIndexPage() {
  const lessons = getAllLessons();
  const completedLessonIds = getCompletedLessonIds();
  const progress = getProgress();

  const lessonsWithStatus = lessons.map((l) => ({
    ...l,
    completed: completedLessonIds.has(l.id),
  }));

  const grouped = DIFFICULTY_ORDER.map((d) => ({
    difficulty: d,
    items: lessonsWithStatus.filter((l) => l.difficulty === d),
  })).filter((g) => g.items.length > 0);

  const completed = lessonsWithStatus.filter((l) => l.completed).length;

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Pill tone="accent">
          <TerminalIcon size={12} /> ~/lessons
        </Pill>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Lessons
        </h1>
        <p className="max-w-2xl text-slate-400">
          Work through the chapters in order. Each lesson ends with a small
          challenge. Your progress is saved on this browser.
        </p>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <ProgressBar
            value={completed}
            max={lessons.length}
            label="Overall progress"
          />
          <div className="text-sm text-slate-400 sm:text-right">
            <div className="font-mono text-base text-slate-200">
              {completed}
              <span className="text-slate-500"> / {lessons.length}</span>
            </div>
            <div className="text-xs text-slate-500">
              {Object.keys(progress.quiz).length} quiz attempt
              {Object.keys(progress.quiz).length === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-10">
        {grouped.map((group) => (
          <section key={group.difficulty} className="space-y-3">
            <div className="flex items-center gap-3">
              <Pill tone={group.difficulty}>
                {DIFFICULTY_LABELS[group.difficulty]}
              </Pill>
              <span className="text-xs text-slate-500">
                {group.items.filter((l) => l.completed).length}/
                {group.items.length} complete
              </span>
            </div>
            <ul className="space-y-3">
              {group.items.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function LessonRow({ lesson }: { lesson: Lesson & { completed: boolean } }) {
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
              : 'border-slate-800 bg-slate-900/80 text-slate-400 group-hover:border-[var(--lx-accent)]/40 group-hover:text-[var(--lx-accent)]'
          }`}
          aria-hidden
        >
          {lesson.completed ? <CheckIcon size={18} /> : lesson.order}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-semibold text-slate-100">
              {lesson.title}
            </h2>
            {lesson.completed && <Pill tone="success">Completed</Pill>}
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-400">
            {lesson.description}
          </p>
        </div>

        <ArrowRightIcon
          size={18}
          className="shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-[var(--lx-accent)]"
        />
      </Link>
    </li>
  );
}
