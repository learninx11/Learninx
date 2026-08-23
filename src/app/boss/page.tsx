import Link from 'next/link';
import { getAllBosses } from '@/lib/bosses';
import { Pill } from '@/components/ui/Pill';
import { TargetIcon, TerminalIcon } from '@/components/ui/Icon';

export const metadata = {
  title: 'Boss levels · Learninx',
  description:
    'Multi-step Linux challenges. Restore a broken service, sort a messy log folder, and more — all in the in-browser sandbox.',
};

export default function BossIndexPage() {
  const bosses = getAllBosses();
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Pill tone="accent">
          <TargetIcon size={12} /> ~/boss-levels
        </Pill>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Boss levels
        </h1>
        <p className="max-w-2xl text-[var(--lx-muted)]">
          Multi-step challenges for learners who have finished the regular
          catalogue. Each boss is a scenario: read what is wrong, plan your
          moves, and type the right commands. You can use the in-browser
          terminal below each step.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {bosses.map((b) => (
          <Link
            key={b.id}
            href={`/boss/${b.slug}`}
            className="lx-card lx-card-interactive group flex flex-col gap-3 p-5 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--lx-border)] bg-slate-900/40 text-[var(--lx-accent)]"
                aria-hidden
              >
                <TerminalIcon size={18} />
              </span>
              <Pill tone={b.difficulty}>{b.difficulty}</Pill>
            </div>
            <h2 className="text-xl font-semibold">{b.title}</h2>
            <p className="text-sm text-[var(--lx-muted)]">{b.description}</p>
            <div className="mt-auto flex items-center justify-between text-xs text-[var(--lx-muted)]">
              <span>
                {b.steps.length} step{b.steps.length === 1 ? '' : 's'}
              </span>
              <span className="font-mono text-[var(--lx-accent)]">Start →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
