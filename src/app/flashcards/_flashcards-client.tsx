'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  BrainIcon,
  CheckIcon,
  CloseIcon,
  PlayIcon,
  ResetIcon,
  TrophyIcon,
} from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { RichText } from '@/components/ui/RichText';
import { CHEAT_CATEGORIES, type CheatCategory } from '@/lib/cheatsheet';
import {
  buildSession,
  cardsInCategory,
  deckStats,
  isCorrectGuess,
  type Flashcard,
} from '@/lib/flashcards';
import { FLASHCARD_INTERVALS, utcDayKey } from '@/lib/progress-client';
import { useProgress } from '@/lib/progress-context';

type Phase = 'setup' | 'question' | 'answer' | 'done';

const NEW_LIMITS = [5, 10, 20] as const;
const BOX_LABELS = ['Unseen', 'Box 1', 'Box 2', 'Box 3', 'Box 4', 'Mastered'];

export function FlashcardsClient() {
  const { state, ready, answerFlashcard, resetFlashcards } = useProgress();
  const [category, setCategory] = useState<CheatCategory | 'All'>('All');
  const [newLimit, setNewLimit] = useState<number>(10);
  const [phase, setPhase] = useState<Phase>('setup');
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [wasCorrect, setWasCorrect] = useState(false);
  const [overridden, setOverridden] = useState(false);
  const [tally, setTally] = useState({ right: 0, wrong: 0 });
  const [confirmReset, setConfirmReset] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const today = utcDayKey();
  const deck = useMemo(() => cardsInCategory(category), [category]);
  const stats = useMemo(
    () => deckStats(deck, state.flashcards, today),
    [deck, state.flashcards, today],
  );
  const allStats = useMemo(
    () => deckStats(cardsInCategory('All'), state.flashcards, today),
    [state.flashcards, today],
  );
  const sessionSize = stats.due + Math.min(newLimit, stats.fresh);

  const current = queue[index];

  useEffect(() => {
    if (phase === 'question') inputRef.current?.focus();
    if (phase === 'answer') nextRef.current?.focus();
  }, [phase, index]);

  function start() {
    const q = buildSession(deck, state.flashcards, today, newLimit);
    if (q.length === 0) return;
    setQueue(q);
    setIndex(0);
    setGuess('');
    setTally({ right: 0, wrong: 0 });
    setPhase('question');
  }

  function submit(giveUp = false) {
    if (!current) return;
    setWasCorrect(!giveUp && isCorrectGuess(current, guess));
    setOverridden(false);
    setPhase('answer');
  }

  function next() {
    if (!current) return;
    const correct = wasCorrect || overridden;
    // The answer is recorded here rather than on submit so the
    // "I was right" override can still change the outcome.
    answerFlashcard(current.id, correct);
    setTally((t) => (correct ? { ...t, right: t.right + 1 } : { ...t, wrong: t.wrong + 1 }));
    let nextQueue = queue;
    if (!correct) {
      // Missed cards come round again at the end of this session.
      nextQueue = [...queue, current];
      setQueue(nextQueue);
    }
    setGuess('');
    if (index + 1 >= nextQueue.length) {
      setPhase('done');
    } else {
      setIndex(index + 1);
      setPhase('question');
    }
  }

  function endSession() {
    // Keep an answer that is already on screen instead of dropping it.
    if (phase === 'answer' && current) {
      const correct = wasCorrect || overridden;
      answerFlashcard(current.id, correct);
      setTally((t) => (correct ? { ...t, right: t.right + 1 } : { ...t, wrong: t.wrong + 1 }));
    }
    setPhase('done');
  }

  const header = (
    <header className="space-y-3 pt-6 text-center sm:pt-10">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--lx-border)] bg-[var(--lx-card)] px-3 py-1 font-mono text-xs text-[var(--lx-accent)]">
        <BrainIcon size={12} /> ~/flashcards $ recall
      </div>
      <h1 className="text-balance text-3xl font-bold sm:text-4xl">Command flashcards</h1>
      <p className="mx-auto max-w-2xl text-pretty text-sm text-[var(--lx-muted)] sm:text-base">
        Read what a command does, then type its name. Cards you get right come back
        less often. Cards you miss come back today. A few minutes a day moves the
        whole cheatsheet into memory.
      </p>
    </header>
  );

  if (phase === 'setup') {
    return (
      <div className="space-y-10">
        {header}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Due today" value={ready ? allStats.due : 0} accent />
          <Stat label="Unseen" value={ready ? allStats.fresh : allStats.total} />
          <Stat label="Learning" value={ready ? allStats.learning : 0} />
          <Stat label="Mastered" value={ready ? allStats.mastered : 0} />
        </section>

        <section className="lx-card space-y-6 p-5 sm:p-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--lx-muted)]">
              Deck
            </h2>
            <div className="flex flex-wrap gap-2">
              <Chip
                label="All"
                count={cardsInCategory('All').length}
                active={category === 'All'}
                onClick={() => setCategory('All')}
              />
              {CHEAT_CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  count={cardsInCategory(c).length}
                  active={category === c}
                  onClick={() => setCategory(c)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--lx-muted)]">
              New cards per session
            </h2>
            <div className="flex gap-2">
              {NEW_LIMITS.map((n) => (
                <Chip
                  key={n}
                  label={String(n)}
                  active={newLimit === n}
                  onClick={() => setNewLimit(n)}
                />
              ))}
            </div>
          </div>

          <BoxBar boxes={stats.boxes} total={stats.total} />

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--lx-muted)]">
              {sessionSize === 0
                ? 'Nothing due in this deck. Come back tomorrow, or pick another deck.'
                : `This session: ${stats.due} due and ${Math.min(newLimit, stats.fresh)} new.`}
            </p>
            <button
              type="button"
              onClick={start}
              disabled={!ready || sessionSize === 0}
              className="lx-btn lx-btn-primary"
            >
              <PlayIcon size={14} /> Start review
            </button>
          </div>
        </section>

        <section className="space-y-3 text-sm text-[var(--lx-muted)]">
          <h2 className="text-base font-semibold text-[var(--lx-fg)]">How the schedule works</h2>
          <p>
            Every card lives in one of five boxes. A right answer moves it up one box. A
            miss sends it back to box 1.
          </p>
          <ul className="grid gap-2 sm:grid-cols-5">
            {[1, 2, 3, 4, 5].map((b) => (
              <li key={b} className="rounded-md border border-[var(--lx-border)] px-3 py-2">
                <span className="block text-xs uppercase tracking-wider">{BOX_LABELS[b]}</span>
                <span className="text-[var(--lx-fg)]">
                  {FLASHCARD_INTERVALS[b] === 0
                    ? 'again today'
                    : `in ${FLASHCARD_INTERVALS[b]} day${FLASHCARD_INTERVALS[b] === 1 ? '' : 's'}`}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {confirmReset ? (
              <>
                <span>Forget every card&apos;s schedule?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetFlashcards();
                    setConfirmReset(false);
                  }}
                  className="lx-btn lx-btn-sm lx-btn-danger"
                >
                  Yes, reset cards
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="lx-btn lx-btn-sm lx-btn-ghost"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="lx-btn lx-btn-sm lx-btn-ghost"
                disabled={!ready || Object.keys(state.flashcards).length === 0}
              >
                <ResetIcon size={12} /> Reset flashcard progress
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  if (phase === 'done') {
    const reviewed = tally.right + tally.wrong;
    const accuracy = reviewed === 0 ? 0 : Math.round((tally.right / reviewed) * 100);
    return (
      <div className="space-y-10">
        {header}
        <section className="lx-card mx-auto max-w-xl space-y-5 p-6 text-center sm:p-8">
          <TrophyIcon size={28} className="mx-auto text-[var(--lx-accent)]" />
          <h2 className="text-2xl font-semibold">Session complete</h2>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Answers" value={reviewed} />
            <Stat label="Right" value={tally.right} accent />
            <Stat label="Accuracy" value={accuracy} suffix="%" />
          </div>
          <p className="text-sm text-[var(--lx-muted)]">
            {allStats.mastered} of {allStats.total} commands mastered so far.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setPhase('setup')} className="lx-btn lx-btn-primary">
              Back to decks
            </button>
            <Link href="/cheatsheet" className="lx-btn lx-btn-secondary">
              Open cheatsheet <ArrowRightIcon size={14} />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!current) return null;
  const progressPct = Math.round((index / queue.length) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-6 sm:pt-10">
      <div className="flex items-center justify-between text-xs text-[var(--lx-muted)]">
        <span>
          Card {index + 1} of {queue.length}
        </span>
        <span>
          <span className="text-[var(--lx-success)]">{tally.right} right</span> ·{' '}
          <span className="text-[var(--lx-danger)]">{tally.wrong} missed</span>
        </span>
        <button
          type="button"
          onClick={endSession}
          className="rounded-md px-2 py-1 transition hover:text-[var(--lx-accent)]"
        >
          End session
        </button>
      </div>
      <div className="lx-progress" aria-hidden>
        <div className="lx-progress-bar" style={{ width: `${progressPct}%` }} />
      </div>

      <section className="lx-card space-y-5 p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Pill tone="accent">{current.entry.category}</Pill>
          <Pill>{BOX_LABELS[state.flashcards[current.id]?.box ?? 0]}</Pill>
        </div>
        <p className="text-balance text-xl font-medium leading-snug sm:text-2xl">
          <RichText text={current.prompt} />
        </p>

        {phase === 'question' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="space-y-3"
          >
            <label htmlFor="flashcard-guess" className="sr-only">
              Command name
            </label>
            <div className="flex items-center gap-2 font-mono">
              <span aria-hidden className="text-[var(--lx-accent)]">$</span>
              <input
                id="flashcard-guess"
                ref={inputRef}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="type the command"
                className="lx-input flex-1 font-mono"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="lx-btn lx-btn-primary" disabled={!guess.trim()}>
                Check <span className="lx-kbd">Enter</span>
              </button>
              <button type="button" onClick={() => submit(true)} className="lx-btn lx-btn-ghost">
                Show answer
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div
              role="status"
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                wasCorrect || overridden
                  ? 'border-lx-success/30 bg-lx-success/10 text-lx-success'
                  : 'border-lx-danger/30 bg-lx-danger/10 text-lx-danger'
              }`}
            >
              {wasCorrect || overridden ? <CheckIcon size={14} /> : <CloseIcon size={14} />}
              {wasCorrect
                ? 'Correct.'
                : overridden
                  ? 'Counted as correct.'
                  : guess.trim()
                    ? `Not quite. You typed "${guess.trim()}".`
                    : 'Here is the answer.'}
            </div>
            <p className="font-mono text-2xl font-semibold text-[var(--lx-accent)]">
              {current.display}
            </p>
            <p className="text-sm leading-relaxed text-lx-prose-body">
              <RichText text={current.entry.long} />
            </p>
            {current.entry.examples.length > 0 && (
              <ul className="space-y-1">
                {current.entry.examples.slice(0, 4).map((ex) => (
                  <li
                    key={ex}
                    className="rounded-md border border-[var(--lx-border)] bg-[var(--lx-code-bg)] px-3 py-1.5 font-mono text-xs"
                  >
                    $ {ex}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              <button ref={nextRef} type="button" onClick={next} className="lx-btn lx-btn-primary">
                Next card <span className="lx-kbd">Enter</span>
              </button>
              {!wasCorrect && !overridden && guess.trim() && (
                <button
                  type="button"
                  onClick={() => setOverridden(true)}
                  className="lx-btn lx-btn-ghost"
                >
                  I was right
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  suffix,
}: {
  label: string;
  value: number;
  accent?: boolean;
  suffix?: string;
}) {
  return (
    <div className="lx-card flex flex-col gap-1 p-4 text-left">
      <span className="text-xs uppercase tracking-wide text-[var(--lx-muted)]">{label}</span>
      <span className={`font-mono text-2xl font-semibold tabular-nums ${accent ? 'text-lx-accent' : ''}`}>
        {value}
        {suffix}
      </span>
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={count === 0}
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-[var(--lx-accent)] bg-[var(--lx-accent-glow)] text-[var(--lx-accent)]'
          : 'border-lx-border text-lx-muted hover:border-lx-accent/40 hover:text-lx-fg'
      }`}
    >
      {label} {count !== undefined && <span className="opacity-60">{count}</span>}
    </button>
  );
}

/** Stacked bar showing how the current deck is spread across boxes. */
function BoxBar({ boxes, total }: { boxes: number[]; total: number }) {
  if (total === 0) return null;
  const tones = [
    'var(--lx-border-strong)',
    'var(--lx-danger)',
    'var(--lx-warning)',
    'var(--lx-accent-2)',
    'var(--lx-accent)',
    'var(--lx-success)',
  ];
  return (
    <div className="space-y-2">
      <div className="flex h-2 overflow-hidden rounded-full bg-[var(--lx-border)]" aria-hidden>
        {boxes.map((n, i) =>
          n === 0 ? null : (
            <div key={i} style={{ width: `${(n / total) * 100}%`, background: tones[i] }} />
          ),
        )}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--lx-muted)]">
        {boxes.map((n, i) => (
          <li key={i} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: tones[i] }} />
            {BOX_LABELS[i]} <span className="text-[var(--lx-fg)]">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
