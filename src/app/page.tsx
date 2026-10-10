import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  AwardIcon,
  BookIcon,
  BrainIcon,
  CheckIcon,
  CodeIcon,
  KeyboardIcon,
  ListIcon,
  MonitorIcon,
  SparklesIcon,
  TargetIcon,
  TerminalIcon,
  TrophyIcon,
  UserIcon,
} from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { RichText } from '@/components/ui/RichText';
import { getAllLessons } from '@/lib/lessons';
import { getAllBosses } from '@/lib/bosses';
import { TRACK_ORDER } from '@/lib/lesson-tracks';
import { COMMAND_NAMES } from '@/lib/shell/evaluator';
import { HeroCta, HomeCtaCard, ReturningPanel, type HomeLesson } from './_home-progress';
import { DailyTipCard } from './_daily-tip';
import { StreakWidget } from '@/components/StreakWidget';

export default function Home() {
  const lessons = getAllLessons();
  const bosses = getAllBosses();
  // Only what the client widgets need — not every lesson's full markdown.
  const lessonLinks: HomeLesson[] = lessons.map(({ id, slug, title, order, track }) => ({
    id,
    slug,
    title,
    order,
    track,
  }));

  return (
    <div className="space-y-20">
      <div className="space-y-10">
        <section className="grid grid-cols-1 items-center gap-12 pt-2 sm:pt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lx-border bg-lx-surface px-3 py-1 font-mono text-xs text-lx-accent">
              <TerminalIcon size={12} /> ~/welcome $ cat about.txt
            </div>

            <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Learn{' '}
              <span className="bg-gradient-to-r from-lx-accent to-lx-accent-2 bg-clip-text text-transparent">
                DevOps
              </span>
              <br className="hidden sm:block" /> the easy way.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-lx-muted lg:mx-0">
              From your first Linux command to CI/CD, cloud, and Kubernetes. Bite-sized
              lessons, hands-on challenges, and a safe terminal that runs right in your
              browser.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <HeroCta lessons={lessonLinks} />
              <a href="#how-it-works" className="lx-btn lx-btn-secondary w-full px-5 py-3 sm:w-auto">
                How it works
              </a>
            </div>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-lx-muted lg:justify-start">
              {['No signup', 'Nothing to install', 'Free forever'].map((perk) => (
                <li key={perk} className="inline-flex items-center gap-1.5">
                  <CheckIcon size={14} className="text-lx-success" /> {perk}
                </li>
              ))}
            </ul>
          </div>

          <TerminalPreview />
        </section>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lx)] border border-lx-border bg-lx-border sm:grid-cols-4">
          <Stat value={lessons.length} label="Lessons" />
          <Stat value={TRACK_ORDER.length} label="Learning tracks" />
          <Stat value={COMMAND_NAMES.length} label="Sandbox commands" />
          <Stat value={bosses.length} label="Boss levels" />
        </dl>

        <ReturningPanel lessons={lessonLinks} />
      </div>

      <section id="how-it-works" className="scroll-mt-20 space-y-6">
        <SectionHeading
          eyebrow={
            <>
              <SparklesIcon size={12} /> How it works
            </>
          }
          title="Three steps. One sandbox."
        />
        <ol className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            step="01"
            icon={<BookIcon size={20} />}
            title="Read a short lesson"
            body="From your first `ls` to Jenkins pipelines and Kubernetes — focused chapters with real examples, each about five minutes long."
          />
          <FeatureCard
            step="02"
            icon={<MonitorIcon size={20} />}
            title="Practice in the sandbox"
            body="A realistic shell with a filesystem, history, and tab completion runs in your browser. Break anything — nothing touches your machine."
          />
          <FeatureCard
            step="03"
            icon={<TrophyIcon size={20} />}
            title="Prove it and level up"
            body="Solve the challenge, pass the quick quiz, and the lesson is done. Earn points, keep a streak, and unlock badges."
          />
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <DailyTipCard />
        <StreakWidget />
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow={
            <>
              <TargetIcon size={12} /> More to explore
            </>
          }
          title="Tools for self-directed learners."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ExploreCard
            href="/terminal"
            icon={<TerminalIcon size={18} />}
            title="Terminal"
            body="A free-practice sandbox with no lesson attached. Explore, break, rebuild."
          />
          <ExploreCard
            href="/boss"
            icon={<TargetIcon size={18} />}
            title="Boss levels"
            body="Multi-step scenarios: fix a broken service, sort a messy log folder, and more."
          />
          <ExploreCard
            href="/flashcards"
            icon={<BrainIcon size={18} />}
            title="Flashcards"
            body="Spaced repetition for every sandbox command, so they stick for good."
          />
          <ExploreCard
            href="/typing"
            icon={<KeyboardIcon size={18} />}
            title="Typing test"
            body="Type real shell commands against the clock. 30 WPM earns a badge."
          />
          <ExploreCard
            href="/cheatsheet"
            icon={<ListIcon size={18} />}
            title="Cheatsheet"
            body="A searchable reference of every command the sandbox supports."
          />
          <ExploreCard
            href="/explain"
            icon={<CodeIcon size={18} />}
            title="Explain a command"
            body="Paste a one-liner and get every command, flag, pipe, and redirect explained."
          />
          <ExploreCard
            href="/achievements"
            icon={<AwardIcon size={18} />}
            title="Achievements"
            body="Badges for streaks, perfect quizzes, boss runs, typing speed, and more."
          />
          <ExploreCard
            href="/profile"
            icon={<UserIcon size={18} />}
            title="Profile & backup"
            body="Lifetime stats, an activity heatmap, and export or import of your progress."
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="lx-card relative overflow-hidden p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lx-accent-glow blur-3xl"
          />
          <Pill tone="accent">Who is this for?</Pill>
          <h2 className="mt-3 text-xl font-semibold sm:text-2xl">
            Anyone going from terminal novice to DevOps-ready.
          </h2>
          <ul className="mt-5 space-y-3 text-lx-prose-body">
            {[
              'Beginners who have never opened a terminal.',
              'Developers who want to be comfortable on a server.',
              'Anyone preparing for a DevOps, cloud, or SRE role.',
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lx-accent/15 text-lx-accent"
                >
                  <CheckIcon size={12} />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <HomeCtaCard lessons={lessonLinks} />
      </section>
    </div>
  );
}

/** A static, illustrative sandbox session for the hero. */
function TerminalPreview() {
  const prompt = (path: string) => (
    <>
      <span className="text-lx-accent">learner@learninx</span>
      <span className="text-lx-subtle">:</span>
      <span className="text-lx-accent-2">{path}</span>
      <span className="text-lx-subtle">$ </span>
    </>
  );
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-xl lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-3 -inset-y-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-lx-accent/25 via-transparent to-lx-accent-2/25 blur-2xl sm:-inset-6"
      />
      <figure
        role="img"
        aria-label="Example sandbox session: make a project folder, write a config file, read it back with grep, and pass the lesson challenge."
        className="lx-theme-dark lx-terminal overflow-hidden text-left"
      >
        <div className="flex items-center gap-1.5 border-b border-lx-border bg-lx-bg-elevated/70 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]/80" />
          <span className="ml-3 truncate font-mono text-xs text-lx-muted">learner@learninx: ~/projects/api</span>
          <span className="ml-auto hidden rounded-full border border-lx-border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-lx-subtle sm:inline">
            Lesson sandbox
          </span>
        </div>
        <div aria-hidden className="space-y-1.5 overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-lx-fg sm:p-5 sm:text-[13.5px]">
          <p className="whitespace-nowrap">
            {prompt('~')}mkdir -p projects/api && cd projects/api
          </p>
          <p className="whitespace-nowrap">
            {prompt('~/projects/api')}echo &quot;PORT=8080&quot; &gt; app.env
          </p>
          <p className="whitespace-nowrap">
            {prompt('~/projects/api')}cat app.env | grep PORT
          </p>
          <p className="whitespace-nowrap">
            <span className="font-semibold text-lx-danger">PORT</span>=8080
          </p>
          <p className="my-2 inline-flex items-center gap-2 rounded-md border border-lx-success/30 bg-lx-success/10 px-2.5 py-1 text-lx-success">
            <CheckIcon size={13} /> Challenge passed · lesson complete · +10 points
          </p>
          <p className="whitespace-nowrap">
            {prompt('~/projects/api')}
            <span className="inline-block h-[1.1em] w-[0.6em] translate-y-[0.2em] animate-lx-blink bg-lx-accent" />
          </p>
        </div>
      </figure>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-lx-surface-strong px-4 py-5 text-center">
      <dt className="order-2 text-xs text-lx-muted">{label}</dt>
      <dd className="order-1 font-mono text-2xl font-semibold tabular-nums text-lx-fg sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: ReactNode; title: string }) {
  return (
    <div>
      <Pill tone="accent">{eyebrow}</Pill>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
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
      className="lx-card lx-card-interactive group relative flex flex-col gap-2 overflow-hidden p-5"
    >
      <span
        aria-hidden
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-lx-border bg-lx-surface text-lx-accent transition group-hover:border-lx-accent/40"
      >
        {icon}
      </span>
      <h3 className="mt-1 font-semibold text-lx-fg">{title}</h3>
      <p className="text-sm leading-relaxed text-lx-muted">{body}</p>
      <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-lx-accent">
        Open
        <ArrowRightIcon size={12} className="transition-transform group-hover:translate-x-0.5" />
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
    <li className="lx-card group relative list-none overflow-hidden p-6">
      <div className="flex items-center justify-between">
        <span
          aria-hidden
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-lx-border bg-lx-surface text-lx-accent transition group-hover:border-lx-accent/40"
        >
          {icon}
        </span>
        <span aria-hidden className="font-mono text-xs text-lx-subtle">
          {step}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-lx-muted">
        <RichText text={body} />
      </p>
    </li>
  );
}
