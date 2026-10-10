'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightIcon,
  CheckIcon,
  LightbulbIcon,
  RotateCcwIcon,
  ShuffleIcon,
} from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { RichText } from '@/components/ui/RichText';
import { useProgress } from '@/lib/progress-context';
import { getAllTips, getDailyTip } from '@/lib/tips';

export function DailyTipCard() {
  const { ready, state, markTipSeen, recordTipSeen } = useProgress();
  // Render an empty card on the server / before hydration so the static
  // HTML matches the first client render. We compute the real tip on
  // mount in the user's local time.
  const [today, setToday] = useState<
    | { tip: { title: string; body: string; example: string }; index: number; dayKey: string }
    | null
  >(null);
  // `view` indexes the TIPS catalogue. `null` means "show today's".
  const [view, setView] = useState<number | null>(null);
  // Re-open today's tip after it was dismissed with "Got it".
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const t = getDailyTip();
    setToday({ tip: t.tip, index: t.index, dayKey: t.dayKey });
  }, []);

  const tips = useMemo(() => getAllTips(), []);
  const currentIndex = view ?? today?.index ?? 0;
  const currentTip = today != null ? tips[currentIndex] ?? today.tip : null;

  // Once today's tip has been read on this browser the card collapses to
  // a one-liner (a new tip arrives tomorrow, when the day key changes).
  // Exploring other tips never counts as reading today's.
  const onToday = today != null && (view ?? today.index) === today.index;
  const seenToday = ready && today != null && onToday && state.lastTipDay === today.dayKey;

  if (today == null || currentTip == null) {
    return <div className="lx-card h-full min-h-[12rem] animate-pulse" aria-hidden />;
  }

  const shuffle = () => {
    if (tips.length <= 1) return;
    // Prefer a tip the visitor has not seen yet. Fall back to any
    // other tip.
    const seen = new Set(state.tipsSeen);
    const others = tips.map((_, i) => i).filter((i) => i !== currentIndex);
    const unseen = others.filter((i) => !seen.has(i));
    const pool = unseen.length > 0 ? unseen : others;
    const next = pool[Math.floor(Math.random() * pool.length)];
    if (next === undefined) return;
    setView(next);
    recordTipSeen(next);
  };

  const backToToday = () => {
    setView(null);
    // Record today's deterministic tip as seen so it counts toward
    // the Tip explorer achievement if the visitor never shuffled.
    recordTipSeen(today.index);
  };

  const dismiss = () => {
    // Make sure the day key + today's index get persisted together.
    markTipSeen(today.index);
    setReopened(false);
  };

  if (seenToday && !reopened) {
    return (
      <article className="lx-card flex h-full flex-col justify-between gap-5 p-5 sm:p-6">
        <div>
          <Pill tone="success">
            <CheckIcon size={11} /> Today&apos;s tip read
          </Pill>
          <h2 className="mt-3 text-lg font-semibold">
            <RichText text={currentTip.title} />
          </h2>
          <p className="mt-1 text-sm text-lx-muted">
            A fresh tip arrives tomorrow. You have explored {state.tipsSeen.length} of{' '}
            {tips.length} so far.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setReopened(true)} className="lx-btn lx-btn-secondary lx-btn-sm">
            Read it again
          </button>
          <button type="button" onClick={shuffle} className="lx-btn lx-btn-secondary lx-btn-sm">
            <ShuffleIcon size={12} /> Another tip
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="lx-card relative h-full overflow-hidden p-5 sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lx-accent-glow blur-3xl"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="accent">
          <LightbulbIcon size={12} /> {onToday ? 'Tip of the day' : 'Tip explorer'}
        </Pill>
        <span className="text-xs text-lx-subtle">
          {onToday ? today.dayKey : `Tip ${currentIndex + 1} of ${tips.length}`}
        </span>
        <span className="ml-auto text-[0.65rem] uppercase tracking-wider text-lx-subtle">
          {state.tipsSeen.length} seen
        </span>
      </div>
      <h2 className="mt-3 text-lg font-semibold sm:text-xl">
        <RichText text={currentTip.title} />
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-lx-muted">
        <RichText text={currentTip.body} />
      </p>
      <pre className="mt-3 overflow-x-auto rounded-md border border-lx-border bg-lx-code-bg px-3 py-2 font-mono text-xs text-lx-fg">
        <code>{currentTip.example}</code>
      </pre>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {onToday ? (
          <button type="button" onClick={dismiss} className="lx-btn lx-btn-secondary lx-btn-sm">
            <CheckIcon size={12} /> Got it
          </button>
        ) : (
          <button type="button" onClick={backToToday} className="lx-btn lx-btn-secondary lx-btn-sm">
            <RotateCcwIcon size={12} /> Back to today
          </button>
        )}
        <button
          type="button"
          onClick={shuffle}
          disabled={tips.length <= 1}
          className="lx-btn lx-btn-secondary lx-btn-sm"
        >
          <ShuffleIcon size={12} /> Another tip
        </button>
        <Link
          href="/cheatsheet"
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-lx-accent hover:underline"
        >
          Cheatsheet <ArrowRightIcon size={12} />
        </Link>
      </div>
    </article>
  );
}
