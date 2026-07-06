'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  CheckIcon,
  ResetIcon,
  TerminalIcon,
} from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { createInitialFs, type FsDir } from '@/lib/shell/fs';
import { runCommand, type ShellContext } from '@/lib/shell/evaluator';
import { getBossBySlug, type BossLevel } from '@/lib/bosses';

interface Props {
  slug: string;
}

type StepStatus = 'pending' | 'passed' | 'failed';

export function BossClient({ slug }: Props) {
  // Look up the boss in the client bundle. `getBossBySlug` is a pure
  // function over the in-code boss catalogue, so it works in both
  // server and client components.
  const boss = getBossBySlug(slug);
  if (!boss) {
    return (
      <div className="lx-card p-6 text-sm text-[var(--lx-muted)]">
        Unknown boss: <code>{slug}</code>
      </div>
    );
  }
  return <BossRunner boss={boss} />;
}

function BossRunner({ boss }: { boss: BossLevel }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [statuses, setStatuses] = useState<StepStatus[]>(() =>
    boss.steps.map(() => 'pending'),
  );
  const [lastRun, setLastRun] = useState<{
    command: string;
    output: string;
    message: string;
    ok: boolean;
  } | null>(null);

  const isComplete = statuses.every((s) => s === 'passed');
  const currentStep = boss.steps[stepIdx];

  function reset() {
    setStepIdx(0);
    setStatuses(boss.steps.map(() => 'pending'));
    setLastRun(null);
  }

  // Run the user's command in a fresh seeded VFS and grade it.
  function runAndGrade(command: string) {
    const trimmed = command.trim();
    if (!trimmed) {
      setLastRun({
        command: '',
        output: '',
        message: 'Type a command first.',
        ok: false,
      });
      return;
    }
    const root: FsDir = createInitialFs();
    boss.seedVfs(root);
    const ctx: ShellContext = {
      cwd: '/home/learner',
      fs: root,
      user: 'learner',
      host: 'learninx-sandbox',
      history: [],
      env: {},
    };
    const out = runCommand(trimmed, ctx);
    const output =
      out == null ? '' : Array.isArray(out) ? out.join('\n') : out;
    const result = currentStep.verify({
      fs: ctx.fs,
      cwd: ctx.cwd,
      output,
      command: trimmed,
    });
    setLastRun({
      command: trimmed,
      output,
      message: result.message,
      ok: result.ok,
    });
    if (result.ok) {
      setStatuses((prev) => {
        const next = [...prev];
        next[stepIdx] = 'passed';
        return next;
      });
    } else {
      setStatuses((prev) => {
        const next = [...prev];
        next[stepIdx] = 'failed';
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Steps overview */}
      <ol className="grid gap-2 sm:grid-cols-2">
        {boss.steps.map((s, i) => {
          const status = statuses[i];
          const active = i === stepIdx;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  setStepIdx(i);
                  setLastRun(null);
                }}
                className={`lx-card flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                  active
                    ? 'border-[var(--lx-accent)]/50 bg-[var(--lx-accent-glow)]/30'
                    : ''
                }`}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    status === 'passed'
                      ? 'bg-[var(--lx-success)]/20 text-[var(--lx-success)]'
                      : status === 'failed'
                        ? 'bg-[var(--lx-danger)]/20 text-[var(--lx-danger)]'
                        : 'border border-[var(--lx-border)] text-[var(--lx-muted)]'
                  }`}
                >
                  {status === 'passed' ? <CheckIcon size={14} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {s.title}
                  </span>
                  <span
                    className={`block truncate text-xs ${
                      status === 'passed'
                        ? 'text-[var(--lx-success)]'
                        : status === 'failed'
                          ? 'text-[var(--lx-danger)]'
                          : 'text-[var(--lx-muted)]'
                    }`}
                  >
                    {status === 'passed'
                      ? 'Passed'
                      : status === 'failed'
                        ? 'Needs another try'
                        : 'Pending'}
                  </span>
                </span>
                {active && (
                  <Pill tone="accent" className="!text-[0.6rem]">
                    Current
                  </Pill>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {isComplete ? (
        <CompleteBanner onReset={reset} />
      ) : (
        <StepRunner
          step={currentStep}
          stepNumber={stepIdx + 1}
          totalSteps={boss.steps.length}
          canPrev={stepIdx > 0}
          canNext={statuses[stepIdx] === 'passed' && stepIdx < boss.steps.length - 1}
          onPrev={() => {
            setStepIdx((i) => Math.max(0, i - 1));
            setLastRun(null);
          }}
          onNext={() => {
            setStepIdx((i) => Math.min(boss.steps.length - 1, i + 1));
            setLastRun(null);
          }}
          lastRun={lastRun}
          onRun={runAndGrade}
        />
      )}
    </div>
  );
}

function CompleteBanner({ onReset }: { onReset: () => void }) {
  return (
    <div className="lx-pulse-success lx-card flex flex-col items-start justify-between gap-3 border-[var(--lx-success)]/30 p-6 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <Pill tone="success">
            <CheckIcon size={10} /> All steps passed
          </Pill>
        </div>
        <h2 className="mt-2 text-xl font-semibold">Boss cleared!</h2>
        <p className="text-sm text-[var(--lx-muted)]">
          You solved every step. Reset to try again, or pick another boss.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReset}
          className="lx-btn lx-btn-secondary"
        >
          <ResetIcon size={14} /> Reset boss
        </button>
        <Link href="/boss" className="lx-btn lx-btn-primary">
          All bosses <ArrowRightIcon size={14} />
        </Link>
      </div>
    </div>
  );
}

interface StepRunnerProps {
  step: BossLevel['steps'][number];
  stepNumber: number;
  totalSteps: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  lastRun: {
    command: string;
    output: string;
    message: string;
    ok: boolean;
  } | null;
  onRun: (cmd: string) => void;
}

function StepRunner({
  step,
  stepNumber,
  totalSteps,
  canPrev,
  canNext,
  onPrev,
  onNext,
  lastRun,
  onRun,
}: StepRunnerProps) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <section className="lx-card flex flex-col gap-4 p-5 sm:p-6">
        <header className="flex items-center gap-2">
          <Pill tone="accent">
            <TerminalIcon size={12} /> Step {stepNumber} of {totalSteps}
          </Pill>
        </header>
        <h2 className="text-xl font-semibold">{step.title}</h2>
        <p className="text-[var(--lx-fg)]">{step.prompt}</p>
        {step.hint && (
          <div>
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="text-xs text-[var(--lx-accent)] hover:underline"
            >
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            {showHint && (
              <p className="mt-2 rounded-md border border-[var(--lx-border)] bg-[var(--lx-code-bg)]/40 p-3 font-mono text-xs text-[var(--lx-muted)]">
                {step.hint}
              </p>
            )}
          </div>
        )}

        {lastRun && (
          <div
            className={`rounded-md border p-3 text-sm ${
              lastRun.ok
                ? 'border-[var(--lx-success)]/40 bg-[var(--lx-success)]/10 text-[var(--lx-success)]'
                : 'border-[var(--lx-danger)]/40 bg-[var(--lx-danger)]/10 text-[var(--lx-danger)]'
            }`}
            role="status"
          >
            <div className="font-semibold">
              {lastRun.ok ? '✓ Correct.' : '✗ Not yet.'}
            </div>
            <div className="mt-1 text-[var(--lx-fg)]">{lastRun.message}</div>
            <pre className="mt-2 max-h-48 overflow-auto rounded bg-[var(--lx-code-bg)] p-2 text-xs text-[var(--lx-fg)]">
              <code>
                $ {lastRun.command}
                {'\n'}
                {lastRun.output || '(no output)'}
              </code>
            </pre>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 border-t border-[var(--lx-border)] pt-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            className="lx-btn lx-btn-ghost"
          >
            ← Previous step
          </button>
          {lastRun?.ok ? (
            canNext ? (
              <button
                type="button"
                onClick={onNext}
                className="lx-btn lx-btn-primary"
              >
                Next step <ArrowRightIcon size={14} />
              </button>
            ) : (
              <span className="lx-pill lx-pill-success">
                <CheckIcon size={10} /> All steps passed
              </span>
            )
          ) : null}
        </div>
      </section>

      <BossTerminal onRun={onRun} />
    </div>
  );
}

function BossTerminal({ onRun }: { onRun: (cmd: string) => void }) {
  // The boss terminal is a "sandbox per attempt": we run each command
  // in a fresh seeded VFS, so it doesn't accumulate state. The visible
  // terminal just echoes what the user typed (and the result message
  // appears in the side panel). This is intentional — the focus is the
  // puzzle, not the shell.
  const [typed, setTyped] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [typed]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cmd = typed;
    setTyped((t) => t + `\n$ ${cmd}\n→ submitted for grading (see left panel)`);
    onRun(cmd);
  }

  return (
    <section
      className="lx-card flex flex-col gap-2 p-3 sm:p-4"
      aria-label="Boss terminal"
    >
      <header className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--lx-muted)]">
          Sandbox
        </span>
        <span className="text-[0.65rem] text-[var(--lx-muted)]">
          Each command runs against a fresh seeded filesystem.
        </span>
      </header>
      <div
        ref={outputRef}
        className="max-h-72 min-h-[10rem] overflow-auto rounded-md border border-[var(--lx-border)] bg-[var(--lx-code-bg)] p-3 font-mono text-sm text-[var(--lx-fg)]"
      >
        {typed ? (
          <pre className="whitespace-pre-wrap">{typed}</pre>
        ) : (
          <p className="text-[var(--lx-muted)]">
            Type a command and press Enter. The command runs in a fresh VFS;
            the grading result appears in the left panel.
          </p>
        )}
      </div>
      <form onSubmit={submit} className="flex items-center gap-2">
        <span aria-hidden className="font-mono text-[var(--lx-accent)]">
          $
        </span>
        <input
          ref={inputRef}
          value={typed.split('\n').pop()?.replace(/^\$ /, '') ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            const lines = typed.split('\n');
            lines[lines.length - 1] = `$ ${v}`;
            setTyped(lines.join('\n'));
          }}
          placeholder="type a command…"
          className="lx-input"
          aria-label="Command"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="lx-btn lx-btn-primary lx-btn-sm">
          Run
        </button>
      </form>
    </section>
  );
}
