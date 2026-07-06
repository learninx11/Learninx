import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  BookIcon,
  BrainIcon,
  LightbulbIcon,
  MonitorIcon,
  SparklesIcon,
  TargetIcon,
  TerminalIcon,
  TrophyIcon,
} from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { getAllLessons } from '@/lib/lessons';
import { getAllBosses } from '@/lib/bosses';
import {
  HomeCtaButton,
  HomeCtaText,
  HomeProgress,
} from './_home-progress';
import { DailyTipCard } from './_daily-tip';
import { StreakWidget } from '@/components/StreakWidget';

export default function Home() {
  const lessons = getAllLessons();
  const bosses = getAllBosses();

  return (
    <div className="space-y-16">
      <section className="relative pt-6 pb-2 text-center sm:pt-10">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 font-mono text-xs text-[var(--lx-accent)]">
          <TerminalIcon size={12} /> ~/welcome $ cat about.txt
        </div>

        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Learn{' '}
          <span className="bg-gradient-to-r from-[var(--lx-accent)] to-[var(--lx-accent-2)] bg-clip-text text-transparent">
            Linux
          </span>
          <br className="hidden sm:block" /> the easy way.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-slate-400 sm:text-lg">
          Bite-sized lessons, hands-on challenges, and a safe in-browser
          terminal. No signup. No install. Just open the site and start typing
          commands.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link href="/lessons" className="lx-btn lx-btn-primary w-full sm:w-auto">
            Start learning <ArrowRightIcon size={16} />
          </Link>
          <a
            href="#how-it-works"
            className="lx-btn lx-btn-secondary w-full sm:w-auto"
          >
            How it works
          </a>
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <HomeProgress totalLessons={lessons.length} />
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {lessons.length} lessons available · free forever · your progress is
          saved on this browser
        </p>
      </section>

      <section id="how-it-works" className="scroll-mt-20 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="accent">
              <SparklesIcon size={12} /> How it works
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Three steps. One sandbox.
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            step="01"
            icon={<BookIcon size={20} />}
            title="Step-by-step lessons"
            body="From your first `ls` to systemd and shell scripting — short chapters with real examples you can read in 5 minutes."
          />
          <FeatureCard
            step="02"
            icon={<MonitorIcon size={20} />}
            title="Live terminal sandbox"
            body="Practice in a safe, simulated shell right in your browser. Realistic prompt, file system, and history. Nothing touches your machine."
          />
          <FeatureCard
            step="03"
            icon={<TrophyIcon size={20} />}
            title="Quizzes & tracking"
            body="Answer quick questions at the end of each lesson. Pass 80% and the lesson is marked complete. Your progress saves automatically."
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <DailyTipCard />
        </div>
        <StreakWidget />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <Pill tone="accent">
              <TargetIcon size={12} /> More to explore
            </Pill>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              New tools for self-directed learners.
            </h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ExploreCard
            href="/cheatsheet"
            icon={<BookIcon size={20} />}
            title="Cheatsheet"
            body="A searchable reference of every command the in-browser sandbox supports, with examples and category filters."
          />
          <ExploreCard
            href="/boss"
            icon={<TargetIcon size={20} />}
            title="Boss levels"
            body="Multi-step challenges — restore a broken service, sort a messy log folder, and more. Sandbox resets between steps."
          />
          <ExploreCard
            href="/lessons"
            icon={<LightbulbIcon size={20} />}
            title="Streaks & points"
            body="Earn 10 points per completed lesson and 1 per correct quiz answer. Keep the streak alive by showing up daily."
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="lx-card relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--lx-accent-glow)] blur-3xl" />
          <Pill tone="accent">Who is this for?</Pill>
          <h2 className="mt-3 text-xl font-semibold sm:text-2xl">
            For anyone who wants to feel at home on a Linux box.
          </h2>
          <ul className="mt-4 space-y-2.5 text-[var(--lx-fg)]">
            <li className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--lx-accent)]"
                aria-hidden
              />
              <span>Beginners who have never opened a terminal.</span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--lx-accent)]"
                aria-hidden
              />
              <span>Developers who want to be comfortable on a server.</span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--lx-accent)]"
                aria-hidden
              />
              <span>Students preparing for DevOps, cloud, or sysadmin roles.</span>
            </li>
          </ul>
        </div>

        <div className="lx-card flex flex-col justify-between gap-4 p-6 sm:p-8">
          <div>
            <Pill tone="success">Ready when you are</Pill>
            <HomeCtaText totalLessons={lessons.length} />
          </div>
          <Link href="/lessons" className="lx-btn lx-btn-secondary self-start">
            <HomeCtaButton totalLessons={lessons.length} />
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ExploreCard({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="lx-card group relative flex flex-col gap-2 overflow-hidden p-5 sm:p-6"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--lx-accent-glow)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--lx-border)] bg-slate-900/40 text-[var(--lx-accent)] transition group-hover:border-[var(--lx-accent)]/40"
        aria-hidden
      >
        {icon}
      </span>
      <h3 className="font-semibold text-[var(--lx-fg)]">{title}</h3>
      <p className="text-sm leading-relaxed text-[var(--lx-muted)]">{body}</p>
      <span className="mt-auto inline-flex items-center gap-1 text-xs text-[var(--lx-accent)]">
        Open <ArrowRightIcon size={12} />
      </span>
    </Link>
  );
}

function FeatureCard({
  step,
  icon,
  title,
  body,
}: {
  step: string;
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="lx-card group relative overflow-hidden p-6">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--lx-accent-glow)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex items-center justify-between">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-[var(--lx-accent)] transition group-hover:border-[var(--lx-accent)]/40"
          aria-hidden
        >
          {icon}
        </span>
        <span className="font-mono text-xs text-slate-500">{step}</span>
      </div>
      <h3 className="mt-4 font-semibold text-lg">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}
