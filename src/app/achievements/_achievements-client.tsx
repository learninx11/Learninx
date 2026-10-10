'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { AchievementBadge } from '@/components/AchievementBadge';
import {
  ArrowRightIcon,
  AwardIcon,
  BrainIcon,
  SparklesIcon,
} from '@/components/ui/Icon';
import { Pill, ProgressBar } from '@/components/ui/Pill';
import {
  ACHIEVEMENTS,
  achievementProgress,
  evaluateAchievements,
  type Achievement,
} from '@/lib/achievements';
import { getAllLessons } from '@/lib/lessons';
import { getAllBosses } from '@/lib/bosses';
import { useProgress } from '@/lib/progress-context';

export function AchievementsClient() {
  const { state, ready } = useProgress();
  const lessons = getAllLessons();
  const bosses = getAllBosses();
  const derived = useMemo(() => evaluateAchievements(state), [state]);
  const unlocked = new Set(derived.filter((d) => d.unlocked).map((d) => d.id));
  const totalUnlocked = unlocked.size;
  const totalAchievements = ACHIEVEMENTS.length;
  const percent = Math.round((totalUnlocked / totalAchievements) * 100);

  const totalLessons = lessons.length;
  const completedLessons = state.completed.length;
  const perfectQuizzes = Object.values(state.quiz).filter(
    (q) => q.total > 0 && q.correct === q.total,
  ).length;
  const totalBosses = bosses.length;
  const completedBosses = state.bossesCompleted.length;

  return (
    <div className="space-y-12">
      <header className="space-y-3 pt-6 text-center sm:pt-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-lx-border bg-lx-surface px-3 py-1 font-mono text-xs text-lx-accent">
          <AwardIcon size={12} /> ~/badges $ ls
        </div>
        <h1 className="text-balance text-3xl font-bold sm:text-4xl">Achievements</h1>
        <p className="mx-auto max-w-2xl text-pretty text-sm text-lx-muted sm:text-base">
          Earn badges for streaks, perfect quizzes, boss runs, and even for using the
          study tools. Everything is computed from your progress, which lives in
          your browser.
        </p>
      </header>

      <section className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-4">
        <SummaryStat
          label="Unlocked"
          value={`${totalUnlocked}/${totalAchievements}`}
          sub={`${percent}% complete`}
        />
        <SummaryStat
          label="Lessons"
          value={`${completedLessons}/${totalLessons}`}
          sub="completed"
        />
        <SummaryStat
          label="Perfect quizzes"
          value={`${perfectQuizzes}`}
          sub="100% answers"
        />
        <SummaryStat
          label="Bosses"
          value={`${completedBosses}/${totalBosses}`}
          sub="defeated"
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="accent">
              <SparklesIcon size={12} /> Badges
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              {ready
                ? totalUnlocked === 0
                  ? 'Nothing yet — go complete a lesson to get started.'
                  : `${totalUnlocked} of ${totalAchievements} unlocked`
                : 'Loading…'}
            </h2>
          </div>
        </div>

        <ul
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Achievements"
        >
          {ACHIEVEMENTS.map((a) => (
            <AchievementCard
              key={a.id}
              achievement={a}
              unlocked={unlocked.has(a.id)}
              progress={ready ? achievementProgress(state, a.id) : null}
            />
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="accent">
              <BrainIcon size={12} /> Earn more
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Where to look next</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <NextStep
            href="/lessons"
            title="Browse the catalogue"
            body="Find a lesson you have not finished yet. Each one awards +10 points."
          />
          <NextStep
            href="/boss"
            title="Run a boss level"
            body="Multi-step scenarios worth 25 points each, plus the boss-slayer badge."
          />
          <NextStep
            href="/typing"
            title="Take the typing test"
            body="Type real shell commands against the clock — unlock the Fast-fingers and Lightning badges."
          />
          <NextStep
            href="/profile"
            title="Back up your progress"
            body="Export your progress as a JSON file so you can move between machines."
          />
        </div>
      </section>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="lx-card flex flex-col items-center gap-1 p-4 text-center">
      <span className="text-xs uppercase tracking-wide text-lx-subtle">{label}</span>
      <span className="font-mono text-2xl font-semibold tabular-nums text-lx-fg">{value}</span>
      {sub && <span className="text-xs text-lx-muted">{sub}</span>}
    </div>
  );
}

function AchievementCard({
  achievement,
  unlocked,
  progress,
}: {
  achievement: Achievement;
  unlocked: boolean;
  progress: { value: number; max: number } | null;
}) {
  const showProgress = !unlocked && !achievement.hidden && progress && progress.max > 0;
  return (
    <li
      className={
        'lx-card relative flex items-start gap-3 p-4 transition ' +
        (unlocked
          ? 'border-lx-accent/40'
          : 'opacity-75')
      }
    >
      <span
        className={
          'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ' +
          (unlocked
            ? 'border-lx-accent/60 bg-lx-accent/15 text-lx-accent'
            : 'border-lx-border-strong bg-lx-surface text-lx-subtle')
        }
        aria-hidden
      >
        <AchievementBadge glyph={achievement.glyph} size={24} unlocked={unlocked} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold">{achievement.title}</h3>
          {unlocked ? (
            <Pill tone="success">Unlocked</Pill>
          ) : achievement.hidden ? (
            <Pill tone="default">Hidden</Pill>
          ) : (
            <Pill tone="default">Locked</Pill>
          )}
        </div>
        <p className="mt-1 text-sm text-lx-muted">
          {achievement.hidden && !unlocked ? 'Keep going — it will show up here.' : achievement.description}
        </p>
        {showProgress && (
          <ProgressBar
            value={Math.min(progress.value, progress.max)}
            max={progress.max}
            className="mt-2.5"
          />
        )}
      </div>
    </li>
  );
}

function NextStep({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="lx-card lx-card-interactive group flex flex-col gap-2 p-4"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-lx-muted">{body}</p>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-lx-accent">
        Open <ArrowRightIcon size={12} />
      </span>
    </Link>
  );
}
